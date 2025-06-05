const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "Holiday",
  tableName: "holiday",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: true,
    },
    title: {
      type: "varchar",
    },
    date: {
      type: "date",
    },
    is_floater: {
      type: "boolean",
    },
  },
});
