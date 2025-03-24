// controllers/investorDeskController.js
const InvestorDesk = require('../models/Investor.js');

/**
 * GET /api/investor-desk
 * Public endpoint to fetch the single investor desk document.
 */
exports.getInvestorDesk = async (req, res) => {
  try {
    let desk = await InvestorDesk.findOne();
    if (!desk) {
      // If no document exists, create one with default values.
      desk = new InvestorDesk();
      await desk.save();
    }
    // Format the response to include only the public fields.
    const publicDesk = {
      title: desk.title,
      sections: desk.sections.map(section => ({
        _id: section._id,
        title: section.title,
        seo: section.seo, // include SEO info if desired
        documents: section.documents.map(doc => ({
          _id: doc._id,
          title: doc.title,
          fileUrl: doc.fileUrl,
          filename: doc.filename
        }))
      }))
    };
    res.json(publicDesk);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * POST /api/investor-desk/sections
 * Admin endpoint to create a new section (with optional SEO info).
 * Expected JSON body:
 * {
 *   "title": "Policy",
 *   "seo": {
 *     "metaTitle": "Policy - Investor Desk",
 *     "metaDescription": "Description for Policy section",
 *     "metaKeywords": "policy, investor, guidelines"
 *   }
 * }
 */
exports.createSection = async (req, res) => {
  const { title, seo } = req.body;
  try {
    let desk = await InvestorDesk.findOne();
    if (!desk) {
      desk = new InvestorDesk();
    }
    desk.sections.push({ title, seo });
    await desk.save();
    res.status(201).json(desk.sections[desk.sections.length - 1]);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * PUT /api/investor-desk/sections/:sectionId
 * Admin endpoint to update a section’s title and/or SEO information.
 * Expected JSON body:
 * {
 *   "title": "Updated Title",
 *   "seo": {
 *     "metaTitle": "New Meta Title",
 *     "metaDescription": "New description",
 *     "metaKeywords": "new, keywords"
 *   }
 * }
 */

exports.getSection = async (req, res) => {
    try {
        let desk = await InvestorDesk.findOne();
        if (!desk) return res.status(404).json({ message: 'Investor desk not found' });
        const section = desk.sections.id(req.params.sectionId);
        if (!section) return res.status(404).json({ message: 'Section not found' });
        res.json(section);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateSection = async (req, res) => {
  const { title, seo } = req.body;
  try {
    let desk = await InvestorDesk.findOne();
    if (!desk) return res.status(404).json({ message: 'Investor desk not found' });
    const section = desk.sections.id(req.params.sectionId);
    if (!section) return res.status(404).json({ message: 'Section not found' });
    if (title) section.title = title;
    if (seo !== undefined) section.seo = seo;
    await desk.save();
    res.json(section);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * DELETE /api/investor-desk/sections/:sectionId
 * Admin endpoint to delete a section.
 */
exports.deleteSection = async (req, res) => {
    try {
      let desk = await InvestorDesk.findOne();
      if (!desk) return res.status(404).json({ message: 'Investor desk not found' });
      const section = desk.sections.id(req.params.sectionId);
      if (!section) return res.status(404).json({ message: 'Section not found' });
      section.deleteOne();
      await desk.save();
      res.json({ message: 'Section deleted' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };

/**
 * POST /api/investor-desk/sections/:sectionId/documents
 * Admin endpoint to add a document to a section.
 * Use multipart/form-data with fields:
 *   - file (the PDF file)
 *   - title (optional; if omitted, original filename is used)
 */
exports.addDocument = async (req, res) => {
  try {
    const { title } = req.body;
    let desk = await InvestorDesk.findOne();
    if (!desk) return res.status(404).json({ message: 'Investor desk not found' });
    const section = desk.sections.id(req.params.sectionId);
    if (!section) return res.status(404).json({ message: 'Section not found' });
    
    // req.file is provided by Multer (using Amazon S3) and includes req.file.location for the file URL.
    const newDoc = {
      title: title || req.file.originalname,
      fileUrl: req.file.location,
      filename: req.file.originalname,
      fileSize: req.file.size
    };

    section.documents.push(newDoc);
    await desk.save();
    res.status(201).json(section.documents[section.documents.length - 1]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * PUT /api/investor-desk/sections/:sectionId/documents/:docId
 * Admin endpoint to update a document (for example, its title).
 * Expected JSON body:
 * {
 *   "title": "Updated Document Title"
 * }
 */
exports.updateDocument = async (req, res) => {
  const { title } = req.body;
  try {
    let desk = await InvestorDesk.findOne();
    if (!desk) return res.status(404).json({ message: 'Investor desk not found' });
    const section = desk.sections.id(req.params.sectionId);
    if (!section) return res.status(404).json({ message: 'Section not found' });
    const doc = section.documents.id(req.params.docId);
    if (!doc) return res.status(404).json({ message: 'Document not found' });
    if (title) doc.title = title;
    if (req.file) {
        doc.fileUrl = req.file.location;         // S3 URL
        doc.filename = req.file.originalname;      // Original file name
        // Optionally, if your schema stores file size or mimetype, update those:
        doc.size = req.file.size;
        // doc.mimeType = req.file.mimetype;
      }
    await desk.save();
    res.json(doc);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * DELETE /api/investor-desk/sections/:sectionId/documents/:docId
 * Admin endpoint to delete a document from a section.
 */
exports.deleteDocument = async (req, res) => {
    try {
      let desk = await InvestorDesk.findOne();
      if (!desk) return res.status(404).json({ message: 'Investor desk not found' });
      const section = desk.sections.id(req.params.sectionId);
      if (!section) return res.status(404).json({ message: 'Section not found' });
      const doc = section.documents.id(req.params.docId);
      if (!doc) return res.status(404).json({ message: 'Document not found' });
      doc.deleteOne();
      await desk.save();
      res.json({ message: 'Document deleted' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
/**
 * GET /api/investor-desk/sections/:sectionId/documents/:docId
 * Admin endpoint to get the details of a single document.
 */
exports.getDocument = async (req, res) => {
  try {
    let desk = await InvestorDesk.findOne();
    if (!desk) return res.status(404).json({ message: 'Investor desk not found' });
    const section = desk.sections.id(req.params.sectionId);
    if (!section) return res.status(404).json({ message: 'Section not found' });
    const doc = section.documents.id(req.params.docId);
    if (!doc) return res.status(404).json({ message: 'Document not found' });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};