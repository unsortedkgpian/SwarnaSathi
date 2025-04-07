exports.validatePhone = (phone) => {
    return /^\d{10}$/.test(phone);
};

exports.validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};
