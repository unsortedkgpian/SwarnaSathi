const FAQ = require('../models/FAQ');

// Create a new FAQ
exports.createFAQ = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    const faq = new FAQ({
      title,
      description
    });

    const savedFAQ = await faq.save();
    res.status(201).json(savedFAQ);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all FAQs
exports.getAllFAQs = async (req, res) => {
  try {
    const faqs = await FAQ.find();
    res.json(faqs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single FAQ
exports.getFAQ = async (req, res) => {
  try {
    const faq = await FAQ.findById(req.params.id);
    if (!faq) {
      return res.status(404).json({ message: 'FAQ not found' });
    }
    res.json(faq);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update FAQ
exports.updateFAQ = async (req, res) => {
  try {
    const faq = await FAQ.findById(req.params.id);
    if (!faq) {
      return res.status(404).json({ message: 'FAQ not found' });
    }

    const updateData = {
      title: req.body.title || faq.title,
      description: req.body.description || faq.description
    };

    const updatedFAQ = await FAQ.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    res.json(updatedFAQ);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete FAQ
exports.deleteFAQ = async (req, res) => {
  try {
    const faq = await FAQ.findById(req.params.id);
    if (!faq) {
      return res.status(404).json({ message: 'FAQ not found' });
    }

    await FAQ.findByIdAndDelete(req.params.id);
    res.json({ message: 'FAQ deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};