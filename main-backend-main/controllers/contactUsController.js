const ContactUs = require("../models/ContactUs");

// Get the single contact entry
exports.getContact = async (req, res) => {
    try {
        const contact = await ContactUs.findOne(); // Fetch the only contact entry
        if (!contact) {
            return res
                .status(404)
                .json({ message: "Contact details not found" });
        }
        res.json(contact);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createContact = async (req, res) => {
    try {
        const { phone,telephone, email, address } = req.body;
        let contact = new ContactUs({ phone,telephone, email, address });
        const createContact = await contact.save();
        res.json(createContact);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}


// Update the contact details
exports.updateContact = async (req, res) => {
    try {
        const { phone,telephone, email, address } = req.body;
        let contact = await ContactUs.findOne();

        if (!contact) {
            // If no contact exists, create a new one
            contact = new ContactUs({ phone,telephone, email, address });
        } else {
            // Update existing contact details
            contact.phone = phone || contact.phone;
            contact.telephone = telephone || contact.telephone;

            contact.email = email || contact.email;
            contact.address = address || contact.address;
        }

        const updatedContact = await contact.save();
        res.json(updatedContact);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
