import { body, param, query, validationResult} from 'express-validator';

const validate = (req, res, next) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return next(
            errors.array().map((e) => e.msg).join(", "), 400
        );
    }

    next();
}

export const authValidation = {
    register: [
    body("name").trim().notEmpty().withMessage("Nome é obrigatório!"),
    body("email").isEmail().withMessage("Email inválido").normalizeEmail({
        gmail_remove_dots: false
    }),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Senha deve ter no mínimo 6 caracteres"),
    body("cpf")
      .optional()
      .matches(/^\d{11}$/)
      .withMessage("CPF inválido"),
    validate,
    ],
    login: [
        body("email").isEmail().withMessage("Email inválido"),
        body("password").notEmpty().withMessage("Senha é obrigatória"),
        validate,
    ]
}
