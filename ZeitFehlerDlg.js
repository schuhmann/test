define("app/admin/ZeitFehlerDlg", [
	"dojo/_base/declare",
	"dijit/Dialog",
	"dgrid/OnDemandGrid",
	"dgrid/Selection",
	"dgrid/Keyboard",
	"dgrid/extensions/DijitRegistry",
	"dojo/date/locale",
	"dojo/date/stamp",
	"dojo/number",
	"dojo/store/Memory",
	"dojo/aspect"
], function (declare, Dialog, Grid, Selection, Keyboard, DijitRegistry, locale, stamp, number, Memory, aspect) {
	var gridCols = [
			{label: "Tag",	field: "anfdat",
				formatter: function (value) {
					var day;
					day = stamp.fromISOString(value).getDay();
					return "<div class='tag" + day + "'>" + locale.format(stamp.fromISOString(value), {datePattern: "EEE dd.MM.yy", selector: 'date'}) + "</div>";
				}
				},
			{label: "Persnr.",	field: "persnr"},
			{label: "Monteur", field: "mitarbeiter",
				get: function (object) {
					return object.mitarbeiter + " " + object.vorname;
				}
				},
			{label: "Baunr.", field: "baunr",
				formatter: function (value) {
					return ((value === 0) || (value === null)) ? "" : value;
				}
				},
			{label: "Bauherr", field: "bauherr",
				formatter: function (value) {
					return ((value === 0) || (value === null)) ? "" : value;
				}
				},
			{label: "Tätigkeit", field: "taetigkeit",
				formatter: function (value) {
					return value;
				}
				},
			{label: "Lohnart", field: "lohnart",
				get: function (object) {
					return number.format(object.lohnart, {places: 0});
				}
				},
			{label: "Von", field: "timevon",
				formatter: function (value) {
					var ret;
					if (value === "null") {
						ret = "";
					} else {
						ret = value.substr(0, 5);
					}
					return ret;
				}
				},
			{label: "Bis", field: "timebis",
				formatter: function (value) {
					var ret;
					if (value === "null") {
						ret = "";
					} else {
						ret = value.substr(0, 5);
					}
					return ret;
				}
				},
			{label: "Std  ", field: "std",
				get: function (object) {
					return number.format(object.std, {places: 2});
				}
				},
			{label: "Pause", field: "pause",
				get: function (object) {
					return number.format(object.pause, {places: 2});
				}
				}
		],
		CustomGrid = declare([Grid, Selection, Keyboard, DijitRegistry]),
		grid = new CustomGrid({
			noDataMessage: "Keine  vorhanden.",
			store: new Memory({data: [], idProperty: "id"}),
			id: "ZeitFehlerGrid",
			columns: gridCols,
			selectionMode: "single",
			postCreate: function () {
				this.inherited(arguments);
			}
		}),
		dlg = declare(Dialog, {
			style: "width: 790px;",
			fehlerStore: null,
			id: "ZeitFehlerDlg",
			content: grid,
			title: "Für die eingegebenen Zeiten gibt es schon Zeitbuchungen. ",
			postCreate: function () {
				dlg = this;
				this.inherited(arguments);
				aspect.after(dlg, "show", function () {
					grid.store.setData(dlg.fehlerStore);
					grid.refresh();
				});
			}
		});
	return dlg;
});