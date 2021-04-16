export const dateFormatter = (value) => {
  return value ? new Date(value).toLocaleString() : value
};


export const nullCheckFormatter = (value) => {
  return !value ? "-" : value
};