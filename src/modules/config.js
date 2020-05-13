import 'dotenv/config';

export const logging = {
  level: process.env.AMII_LOG_LEVEL || 'info',
  timestampFormat: process.env.AMII_LOG_TIME_FMT
};

export default {
  logging
};
