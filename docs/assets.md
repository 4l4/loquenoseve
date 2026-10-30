# Ассеты

Исходники лежат в `resources/` (PNG, не трогать). `npm run images` конвертирует их в `dist/img/<имя>.webp`.
**Имя ассета** (то, что пишется в `<<bg>>`, `<<fx>>`, `setup.chars`) = имя файла без расширения, в нижнем регистре, `(` → `-`, `)` удаляется.

Новые картинки: положить PNG в `resources/`, запустить `npm run images`, добавить строку в эту таблицу.

## Фоны (16:9, `<<bg>>`)

| Ассет | Что на картинке | Сцена по сюжету |
|---|---|---|
| `background_menu` | размытый терминал аэропорта | главный экран |
| `background_01` | выход из терминала Aeroparque Jorge Newbery, такси за стеклом, закат | «Las puertas del aeropuerto se abren» |
| `background_02` | героиня-силуэт с чемоданом у жёлто-чёрного такси | выход к такси |
| `background_03` | салон такси, вид на дорогу, флаг и вымпел Boca на зеркале | диалог с таксистом |
| `background_04` | вид из окна такси на шоссе | дорога |
| `background_05-face01` | героиня (внешность 1) смотрит в окно такси | «Miro mi reflejo en el vidrio», APARIENCIA 1 |
| `background_05-face02` | **заглушка** «Todavía no está. Elegí la apariencia 1.» | APARIENCIA 2 |
| `background_05-face03` | **заглушка** то же | APARIENCIA 3 |
| `background_06-01` | шоссе: фуры, контейнеры, билборд | «la ciudad se esconde detrás de la autopista» |
| `background_06-02` | под эстакадой | автострада |
| `background_06-03` | городские высотки и трущобы вдоль шоссе | пригороды |
| `background_07-face01` | крупно лицо героини у окна | «Y de pronto se abre» |
| `background_08-01-1` | широкий проспект, Teatro Colón | Av. 9 de Julio |
| `background_08-01-2` | 9 de Julio, Обелиск вдали, зебра | Av. 9 de Julio |
| `background_08-01-3` | Обелиск на солнце, надпись BA | Обелиск |
| `background_08-02-1` | Avenida de Mayo, деревья, старые фасады | Avenida de Mayo |
| `background_08-02-2` | фасады с коваными балконами, автобус Tapiales | балконы |
| `background_08-02-3` | улица с вывесками TIENDA / CARNICERÍA (fileteado) | вывески «fileteado» |
| `background_09-face01` | героиня высунулась из окна такси, улыбается | восторг от города |
| `background_10-01-1` | улица, аллея цветущих жакаранд, лепестки на асфальте | ветка «Jacarandás»: «Toda la ciudad está teñida de lila» |
| `background_10-01-2` | лепестки жакаранд на капоте машины, ступенях, прохожие | ветка «Jacarandás»: «Los pétalos cubren los capós…» |
| `background_10-02-1` | угол улицы: расписной colectivo 39, киоск DIARIOS | ветка «Una esquina»: colectivo |
| `background_10-02-2` | старички с мате у киоска, панадерия | ветка «Una esquina»: mate, медиалунас |
| `background_11-face01` | героиня спит, прислонившись к окну такси | «Apoyo la frente en el vidrio… me quedo dormida» |
| `background_12` | такси у дома в Абасто | приезд к квартире |
| `background_13` | съёмная квартира днём, чемодан на кровати | квартира |
| `background_14` | та же квартира на закате, героиня на подоконнике | «Me siento en el marco de la ventana» |
| `background_15` | телефон с картой в руках героини | интерактивная карта мигрантов |
| `background_16` | вечерняя улица, кафе «Sabores Peruanos» | кафе снаружи |
| `background_17` | интерьер кафе (пустой), меню на доске | кафе внутри |
| `background_18-face01` | героиня ест в кафе | «tengo delante un plato…» |
| `background_19-face01` | героиня задумалась над тарелкой | воспоминания / «¿De dónde sos?» |
| `background_20` | героиня и Матео за столиком в кафе (силуэты) | «Charlamos hasta que cierran» |
| `background_21` | улица Сан-Тельмо, ярмарка | San Telmo, feria del domingo |
| `background_22` | Пуэрто-Мадеро на закате, мост, пара | «Al atardecer llegamos al río» |
| `background_23-face01` | героиня на набережной на закате | финал главы: «¿Qué me espera ahora…?» |

## Оверлеи-переходы (`<<fx>>`)

| Ассет | Что |
|---|---|
| `lighting_01` | размытая вспышка/блик (переход «carga del juego», аэропорт) |
| `lighting_02` | размытое движение у такси (переход в такси) |

## Персонажи (спрайты с прозрачным фоном, `<<char>>`)

| Ассет | id в `setup.chars` | Кто |
|---|---|---|
| `character_17-face01` | `yo` | героиня (внешность 1) |
| `character_17-mateo` | `mateo` | Матео |
| `character_17-personaperu` | `cocinera` | кухарка из Перу, хозяйка кафе |
| — | `taxista` | таксист (без спрайта, виден на `background_03`) |
