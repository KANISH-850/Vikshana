const fs = require('fs');
const path = require('path');
const catalyst = require('zcatalyst-sdk-node');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const { parse: parseCsvSync } = require('csv-parse/sync');
const datastoreClient = require('../queries/datastoreClient');

const ATTACHMENT_FOLDER_NAME = 'investigation-attachments';
const MAX_STORED_TEXT_CHARS = 50000;
let cachedFolderId = null;

/**
 * Unlike Data Store tables (Console-only, no createTable in the SDK), File
 * Store folders CAN be created programmatically — so this self-provisions
 * on first use instead of requiring a manual Console step. If provisioning
 * or upload fails for any reason (permissions, no File Store enabled in
 * catalyst.json yet, etc.) we degrade gracefully: the attachment's extracted
 * text is still stored and usable for retrieval, just without a downloadable
 * original file.
 */
async function getOrCreateFolder(req) {
    if (cachedFolderId) return cachedFolderId;
    try {
        const filestore = catalyst.initialize(req).filestore();
        const folders = await filestore.getAllFolders();
        const existing = folders.find((f) => {
            const details = f._folderDetails || f;
            return details.folder_name === ATTACHMENT_FOLDER_NAME;
        });
        if (existing) {
            cachedFolderId = (existing._folderDetails || existing).id;
            return cachedFolderId;
        }
        const created = await filestore.createFolder(ATTACHMENT_FOLDER_NAME);
        cachedFolderId = (created._folderDetails || created).id;
        return cachedFolderId;
    } catch (error) {
        console.error('[AttachmentService] Folder provisioning failed, raw bytes will not be stored:', error.message);
        return null;
    }
}

/** OCR/audio-transcription are out of scope for this pass — non-text file types return '' and are stored as metadata-only. */
async function extractText(file) {
    const ext = path.extname(file.originalname).toLowerCase();
    try {
        if (ext === '.pdf') {
            const buffer = fs.readFileSync(file.path);
            const parsed = await pdfParse(buffer);
            return parsed.text;
        }
        if (ext === '.docx') {
            const result = await mammoth.extractRawText({ path: file.path });
            return result.value;
        }
        if (ext === '.txt') {
            return fs.readFileSync(file.path, 'utf-8');
        }
        if (ext === '.csv') {
            const raw = fs.readFileSync(file.path, 'utf-8');
            const records = parseCsvSync(raw, { columns: false, skip_empty_lines: true, relax_column_count: true });
            return records.slice(0, 200).map((row) => row.join(' | ')).join('\n');
        }
        return '';
    } catch (error) {
        console.error(`[AttachmentService] Text extraction failed for ${file.originalname}:`, error.message);
        return '';
    }
}

class AttachmentService {
    static async handleUpload(req, file, { caseId, conversationId }) {
        const extractedText = await extractText(file);

        let fileStoreKey = '';
        const folderId = await getOrCreateFolder(req);
        if (folderId) {
            try {
                const uploaded = await catalyst.initialize(req).filestore().folder(folderId).uploadFile({
                    code: fs.createReadStream(file.path),
                    name: file.originalname
                });
                fileStoreKey = String(uploaded.id || '');
            } catch (error) {
                console.error('[AttachmentService] Raw file upload failed, keeping extracted text only:', error.message);
            }
        }

        fs.unlink(file.path, () => {});

        const row = await datastoreClient.insertRow(req, 'Attachment', {
            case_id: caseId,
            conversation_id: conversationId || '',
            filename: file.originalname,
            mime_type: file.mimetype,
            size_bytes: file.size,
            extracted_text: (extractedText || '').slice(0, MAX_STORED_TEXT_CHARS),
            file_store_key: fileStoreKey,
            status: 'ready'
        });

        return {
            id: row.ROWID,
            filename: row.filename,
            mimeType: row.mime_type,
            sizeBytes: row.size_bytes,
            hasExtractedText: !!extractedText,
            status: row.status
        };
    }
}

module.exports = AttachmentService;
