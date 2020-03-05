define("app/admin/BenutzerErfassen", [
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dijit/_WidgetBase",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	'dijit/layout/ContentPane',
	"dojo/text!app/admin/templates/BenutzerErfassen.html",
	"dojo/on",
	"dojo/store/Memory",
	'dojo/_base/window',
	"dojo/_base/array",
	"dojo/request",
	"dijit/registry",
	"dijit/form/Button",
	"dijit/form/Form",
	"dijit/form/NumberTextBox",
	"dijit/form/FilteringSelect",
	"dijit/form/DateTextBox",
	"dijit/form/SimpleTextarea",
	"dijit/form/CheckBox",
	"dojo/domReady!"
], function (declare, lang, WidgetBase, TemplatedMixin, WidgetsInTemplateMixin,
	ContentPane, temp, on, Memory, win, array, request, registry) {
	var app = win.global.app,
		storePruefer = new Memory({
			data: [
				{id: 0, name: 'nein'},
				{id: 1, name: 'ja'}
			]
		}),
		eingabe = null;
	return declare(ContentPane, {
		constructor: function (kwArgs) {
			lang.mixin(this, kwArgs);
			var contentWidget = new (declare([WidgetBase, TemplatedMixin, WidgetsInTemplateMixin], {
					templateString: temp,
					editRow: null
				}))();
			contentWidget.startup();
			this.content = contentWidget;
		},
		postCreate: function () {
			eingabe = this.content;
			this.inherited(arguments);
			on(eingabe.BenutzerErfassen, "submit", function (evt) {
				// prevent the page from navigating after submit
				evt.stopPropagation();
				evt.preventDefault();
			});
			array.forEach([
				{"btn": "btnPersnrSuchen", "tb": "persnr", "col": "persnr"},
				{"btn": "btnNameSuchen", "tb": "name", "col": "name"},
				{"btn": "btnVornameSuchen", "tb": "vorname", "col": "vorname"},
				{"btn": "btnPrueferSuchen", "tb": "pruefer", "col": "pruefer"},
				{"btn": "btnChMonteurSuchen", "tb": "chmonteur", "col": "hhch"},
				{"btn": "btnAzubiSuchen", "tb": "azubi", "col": "azubi"},
                {"btn": "btnAktiveSuchen", "tb": "aktiv", "col": "aktiv"},
				{"btn": "btnAbteilungSuchen", "tb": "abteilung", "col": "abteilungs_id"}
			], function (entry) {
				on(eingabe[entry.btn], "click", function () {
					var obj = {},
						b = "",
						g = registry.byId("adminBenutzerGrid");
					if ((entry.tb === "pruefer") || (entry.tb === "chmonteur") || (entry.tb === "azubi")) {
						b = eingabe[entry.tb].get('displayedValue');
					} else {
						b = eingabe[entry.tb].get('value');
					}
					lang.setObject(entry.col, new RegExp(b, "i"), obj);
					//lang.setObject(entry.col, b, obj);
					if (b) {
						g.set("query", obj);
					} else {
						g.set("query", {});
					}
				});
			});
			eingabe.pruefer.set({
				"store": storePruefer,
				"placeHolder": "Prüfer ?",
				"searchAttr": "name",
				"autoComplete": true
			});
			eingabe.azubi.set({
				"store": storePruefer,
				"placeHolder": "Azubi ?",
				"searchAttr": "name",
				"autoComplete": true
			});
            eingabe.aktiv.set({
                "store": storePruefer,
                "placeHolder": "Aktiv ?",
                "searchAttr": "name",
                "autoComplete": true
            });
			eingabe.chmonteur.set({
				"store": storePruefer,
				"placeHolder": "CH ?",
				"searchAttr": "name",
				"autoComplete": true
			});
			this.content.abteilung.set({
			    "placeHolder": "Abteilung auswählen !",
				"searchAttr": "abteilung",
				"autoComplete": true
			});
			this.content.ausabteilung.set({
				"descending": true,
				"placeHolder": "Abteilung auswählen !",
				"searchAttr": "abteilung",
				"autoComplete": true
			});
			eingabe.persnr.set("disabled", false);
			request.get(app.RequestUrl + "abteilungen/", {
				timeout: 5000,
				preventCache: true,
				handleAs: "json"
			}).then(
				function (res) {
					eingabe.abteilung.set("store", new Memory({idProperty: "id", data: res}));
					eingabe.ausabteilung.set("store", new Memory({idProperty: "id", data: res}));
					eingabe.ausabteilung.store.put({"id": 0, "abteilung": "Keine"});
					eingabe.ausabteilung.store.put({"id": 1, "abteilung": "Alle"});
					eingabe.ausabteilung.store.put({"id": 2, "abteilung": "Eigene"});
				}
			);
		}
	});
});
