const { DateTime } = require('luxon');

const hasExplicitOffset = (value) => /(?:Z|[+-]\d{2}:?\d{2})$/i.test(value);

const parseDueDate = (value, timeZone) => {
  if (typeof value !== 'string' || !value.trim()) return null;

  const parsed = hasExplicitOffset(value)
    ? DateTime.fromISO(value, { setZone: true })
    : timeZone
      ? DateTime.fromISO(value, { zone: timeZone })
      : null;

  if (!parsed?.isValid) return null;
  return parsed.toUTC().toJSDate();
};

module.exports = { parseDueDate };