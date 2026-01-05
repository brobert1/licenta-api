const calculateRate = (value, total) => {
  return total > 0 ? parseFloat(((value / total) * 100).toFixed(2)) : 0;
};

export default calculateRate;
