Hooks.once("ready", () => {
  game.settings.register("actor-to-markdown", "exportPath", {
    name: "Export Path",
    hint: "Путь на сервере для сохранения Markdown-файлов",
    scope: "world",
    config: true,
    type: String,
    default: "/home/ubuntu/obsidian_export/Персонажи"
  });

  game.settings.registerMenu("actor-to-markdown", "exportActors", {
    name: "Экспортировать всех персонажей",
    label: "Экспорт",
    hint: "Экспортировать всех персонажей в Markdown",
    type: class ActorExportMenu extends FormApplication {
      async _updateObject(event, formData) {
        const fs = require("fs");
        const path = game.settings.get("actor-to-markdown", "exportPath");
        for (let actor of game.actors.contents) {
          const name = actor.name.replace(/[^a-zA-Z0-9_-]/g, "_");
          const data = actor.system;
          const type = actor.type;
          const level = data.details?.level?.value || "?";
          const clazz = data.details?.class?.value || "";
          const notes = data.details?.publicNotes || "";
          const text = `# ${actor.name}\n\n- Тип: ${type}\n- Уровень: ${level}\n- Класс: ${clazz}\n\n## Описание:\n${notes}\n`;
          fs.writeFileSync(`${path}/${name}.md`, text, "utf-8");
        }
        ui.notifications.info("Экспорт персонажей завершён.");
      }
    },
    restricted: true
  });
});
