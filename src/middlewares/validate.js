const validate = (schemas) => (req, res, next) => {
    const errors = [];

    for (const bagian of ['params', 'body']) {
        if (!schemas[bagian]) continue;

        const hasil = schemas[bagian].safeParse(req[bagian] ?? {});
        if (!hasil.success) {
            for (const iss of hasil.error.issues) {
                errors.push({ field: iss.path.join('.') || bagian, message: iss.message });
            }
        } else if (bagian === 'body') {
            req.body = hasil.data;
        }
    }

    if (errors.length > 0) {
        return res.status(400).json({ status: 'error', message: 'Data tidak valid', errors });
    }
    next();
};

export default validate;