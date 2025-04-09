let MODULE_ID = "obsidianSyncer";

Hooks.once("ready", async () => {
  game.settings.register(MODULE_ID, "exportPath", {
    name: "Export Path",
    hint: "Путь на сервере для сохранения Markdown-файлов",
    scope: "world",
    config: true,
    type: String,
    default: "/home/ubuntu/obsidian_export/Персонажи"
  });

  game.settings.registerMenu(MODULE_ID, "exportActors", {
    name: "Экспортировать всех персонажей",
    label: "Экспорт",
    hint: "Сохраняет всех актёров в .md-файлы на сервере",
    type: class ActorExportMenu extends FormApplication {
      async _updateObject(event, formData) {
        game.socket.emit("system", {
          type: "export-actors-markdown",
          userId: game.user.id
        });
        ui.notifications.info("Запрос на экспорт отправлен ГМу.");
      }
    },
    restricted: true
  });

  if (game.user.isGM && game.user.active) {
    game.socket.on("system", async (data) => {
      if (data?.type !== "export-actors-markdown") return;

      const fs = require("fs");
      const path = game.settings.get(MODULE_ID, "exportPath");
      if (!fs.existsSync(path)) fs.mkdirSync(path, { recursive: true });

      for (let actor of game.actors.contents) {
        const name = actor.name.replace(/[^a-zA-Z0-9а-яА-ЯёЁ _-]/g, "_");
        const system = actor.system || {};
        const type = actor.type || "";
        const level = system.details?.level?.value || "?";
        const clazz = system.details?.class?.value || "";
        const notes = system.details?.publicNotes || "";

        const text = `# ${actor.name}\n\n- Тип: ${type}\n- Уровень: ${level}\n- Класс: ${clazz}\n\n## Описание:\n${notes}\n`;

        try {
          fs.writeFileSync(`${path}/${name}.md`, text, "utf-8");
        } catch (err) {
          console.error(`Ошибка при записи ${name}.md`, err);
        }
      }

      ui.notifications.info("Экспорт персонажей завершён (на сервере)");
    });
  }
});
