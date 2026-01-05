import { set } from 'lodash';

const transformBodyKeys = (obj) => {
  const result = {};

  Object.entries(obj).forEach(([key, value]) => {
    try {
      value = JSON.parse(value);
    } catch (e) {
      // Do nothing
    }
    set(result, key, value);
  });

  return result;
};

const formDataToJson = (req, _res, next) => {
  req.body = transformBodyKeys(req.body);
  next();
};

export default formDataToJson;
