import * as Joi from '@hapi/joi';

export const configValidationSchema = Joi.object({
    AWS_ACCESS_KEY_ID:Joi.string().required().description('AWS Access Key ID'),
    AWS_SECRET:Joi.string().required().description('AWS Secret Access Key'),
    AWS_REGION:Joi.string().required().description('AWS Region'), 
    AWS_BUCKET_NAME:Joi.string().required().description('AWS S3 Bucket Name'),
    DB_HOST:Joi.string().required().description('Database Host'),
    DB_PORT: Joi.number().default(5432).default(5432).description('Database Port'),
    DB_USERNAME:Joi.string().required().description('Database Username'),
    DB_PASSWORD: Joi.string().required().description('Database Password'),
    DB_DATABASE: Joi.string().required().description('Database Name'),
    JWT_SECRET: Joi.string().required().description('JWT Secret Key'),
});