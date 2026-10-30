# Dudes MCP

MCP-сервер (stdio), через который мультимодальная модель рисует пиксельных дудесов в формате оверлея Twir. Работает с тем же ядром формата, что и редактор: `@twirapp/dudes-sprite`.

## Требования

- Node.js 20+
- pnpm 8+

## Сборка

```bash
pnpm install
pnpm --filter @twirapp/dudes-mcp build
```

## Запуск в Claude Desktop

```json
{
  "mcpServers": {
    "dudes": {
      "command": "node",
      "args": ["/absolute/path/to/dudes/apps/mcp/dist/index.js"],
      "env": {
        "DUDES_WORKSPACE": "/absolute/path/to/dudes-workspace"
      }
    }
  }
}
```

`DUDES_WORKSPACE` — корень, внутри которого сервер читает и пишет проекты. По умолчанию — текущая рабочая директория. Пути в инструментах относительны workspace; выход за его пределы запрещён, включая ссылки на файлы слоёв внутри `dude.json`.

Пример вызова инструмента (JSON-RPC через MCP-клиент):

```json
{
  "name": "set_pixel",
  "arguments": {
    "layer": "body",
    "frame": 0,
    "x": 16,
    "y": 12,
    "color": "#ffffff"
  }
}
```

Для разработки:

```bash
DUDES_WORKSPACE=/tmp/dudes pnpm --filter @twirapp/dudes-mcp dev
```

## Формат

- Холст 32×32, координаты `0..31`, `(0,0)` — левый верхний пиксель.
- 9 кадров: `idle 0–2` (300 мс), `jump 3`, `fall 4`, `land 5`, `run 6–8` (100 мс).
- 5 слоёв снизу вверх: `body`, `eyes`, `mouth`, `hat`, `cosmetics`.
- **Тело только в градациях серого** (`R=G=B`) — бот перекрашивает его через `tint`. Цветное тело блокирует сохранение.
- Альфа бинарная: `00` или `FF`. Полупрозрачные пиксели — предупреждение.
- Тело не может быть пустым; остальные слои опциональны.

## Инструменты

| Инструмент | Назначение |
| --- | --- |
| `get_guide` | Правила формата и советы по рисованию |
| `create_project` | Новый пустой проект (9 кадров × 5 слоёв) |
| `open_project` | Открыть папку-пакет из workspace |
| `save_project` | Записать PNG-стрипы, `dude.json`, `preview.png` |
| `get_project` | Имя, цвета, заполненные кадры, проблемы валидации |
| `list_layers` | Порядок слоёв |
| `set_pixel` | Один пиксель |
| `draw_line` | Линия 1px |
| `draw_rect` | Прямоугольник (заполненный или контур) |
| `draw_ellipse` | Эллипс в bounding box |
| `fill_area` | Заливка связной области |
| `copy_frame` | Копировать все слои кадра |
| `shift_frame` | Сдвиг пикселей кадра (края обрезаются) |
| `mirror_frame` | Отразить кадр по горизонтали/вертикали |
| `clear_frame` | Очистить слой или весь кадр |
| `get_pixels` | Компактная карта пикселей: legend + 32 строки по 32 символа |
| `set_colors` | Цвета tint по слоям |
| `render_preview` | PNG-превью: контактный лист 3×3 или один кадр |
| `validate` | JSON-массив проблем |

## Рабочий цикл модели

1. `get_guide` → `create_project`.
2. Рисовать примитивами кадр 0, затем `copy_frame` и `shift_frame`/`mirror_frame` для остальных кадров.
3. `render_preview` → посмотреть PNG → исправить.
4. `validate` → устранить ошибки.
5. `save_project` → пакет в workspace (папка с PNG-стрипами, `dude.json`, `preview.png`). Такой пакет можно открыть в редакторе, предварительно упаковав его в zip теми же полями (редактор импортирует только zip).

## Разработка

```bash
pnpm --filter @twirapp/dudes-mcp test
pnpm --filter @twirapp/dudes-mcp type-check
```
