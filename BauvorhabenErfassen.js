define("app/admin/BauvorhabenErfassen", [
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dijit/_WidgetBase",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	'dijit/layout/ContentPane',
	"dojo/text!app/admin/templates/BauvorhabenErfassen.html",
	"dojo/on",
	"dojo/store/Memory",
	'dojo/_base/window',
	"dojo/_base/array",
	"dojo/request",
	"dojo/json",
	"dijit/form/Button",
	"dijit/form/Form",
	"dijit/form/NumberTextBox",
	"dijit/form/FilteringSelect",
	"dijit/form/DateTextBox",
	"dijit/form/SimpleTextarea",
	"dijit/form/CheckBox",
	"dojo/domReady!"
], function (declare, lang, WidgetBase, TemplatedMixin, WidgetsInTemplateMixin,
	ContentPane, temp, on, Memory, win, array, request, JSON) {
	var app = win.global.app,
		eingabe = null,
		newObj = null,
		reqData = function (newId) {
			newObj = {
				persnr : eingabe.persnr.get('value'),
				hhch: eingabe.chmonteur.get('value'),
				azubi: eingabe.azubi.get('value'),
				auswertung: eingabe.ausabteilung.get('value'),
				name : eingabe.name.get('value') || "",
				vorname : eingabe.vorname.get('value') || "",
				pruefer : eingabe.pruefer.get('value'),
				abteilungs_id : eingabe.abteilung.get('value')
			};
			if (newId > 0) {lang.setObject("id", newId, newObj); }
			return JSON.stringify(newObj);
		};
	return declare(ContentPane, {
		style: "margin: 0px;padding: 0px;",
		constructor: function (kwArgs) {
			lang.mixin(this, kwArgs);
			var contentWidget = new (declare([WidgetBase, TemplatedMixin, WidgetsInTemplateMixin], {
					templateString: temp,
					editRow: null
				}))();
			contentWidget.startup();
			this.content = contentWidget;
		},
		eingabeGrid : null,
		gridSelect: function (evt) {
			var item = evt.rows[0].data, eingabe = this.content;
			eingabe.editRow = item;
			eingabe.baunr.set('value', item.baunr);
			eingabe.name.set('value', item.name);
			eingabe.vorname.set('value', item.vorname);
			eingabe.str.set('value', item.str);
			eingabe.plz.set('value', item.plz);
			eingabe.ort.set('value', item.ort);
		},
		gridDel: function () {
			//var id = 0, i,
			//	g = this.eingabeGrid;
			//for (i in g.selection) {
			//	if (g.selection.hasOwnProperty(i)) {
					//id = i;
			//		g.store.remove(i)
			//	}
			//}
			/*
			request.del(app.RequestUrl + "benutzer/del/" + id, {
				timeout: 5000,
				preventCache: true,
				handleAs: "json"
			}).then(
				function (res) {
					if (res !== 0) {
						var p = g.get('_currentPage'),
							r = g.get('_rowsOnPage');
						if (r === 1) {
							p--;
						}
						g.store.remove(id);
						g.refresh();
						g.gotoPage(p);
					}
				}
			);
			*/
		},
		gridAdd: function () {
		/*
			eingabe.editRow = null;
			eingabe.baunr.set('value', "");
			eingabe.name.set('value', "");
			eingabe.vorname.set('value', "");
			eingabe.plz.set('value', 0);
			eingabe.ort.set('value', "");
			eingabe.str.set('value', "");
			eingabe.baunr.focus();
		*/
		},
		gridSave: function (btnAdd, btnDel, btnAbort, btnSave) {
			/*
			var g = this.eingabeGrid;
			if (eingabe.BenutzerErfassen.validate()) {
				if (!eingabe.editRow) {
					if (g.store.query({persnr: eingabe.persnr.get('value')})[0]) {
						app.MessageBox({
							title: "Eingabefehler !!",
							message: "Personalnummer schon vorhanden"
						});
						return;
					}
					request.post(app.RequestUrl + "benutzer/add", {
						timeout: 5000,
						data: reqData(0),
						preventCache: true,
						handleAs: "json"
					}).then(
						function (res) {
							if (res !== 0) {
								var p = g.get('_currentPage'),
									r = g.get('_rowsOnPage');
								if (r === g.get('rowsPerPage')) {
									p++;
								}
								g.store.put(res);
								g.refresh();
								g.select(res.id);
								g.gotoPage(p);
								eingabe.editRow = res;
								g.set("selectionMode", "single");
								btnAdd.set("disabled", false);
								btnDel.set("disabled", false);
								btnAbort.set("disabled", true);
								btnSave.set("disabled", false);
							} else {
								app.MessageBox({
									title: "Eingabefehler !!",
									message: "Personalnummer schon vorhanden"
								});
							}
						}
					);
				} else {
					request.put(app.RequestUrl + "benutzer/put", {
						timeout: 5000,
						data: reqData(eingabe.editRow.id),
						preventCache: true,
						handleAs: "json"
					}).then(
						function (res) {
							if (res !== 0) {
								var p = g.get('_currentPage');
								g.store.put(res);
								g.refresh();
								g.gotoPage(p);
								eingabe.editRow = res;
								g.set("selectionMode", "single");
								btnAdd.set("disabled", false);
								btnDel.set("disabled", false);
								btnAbort.set("disabled", true);
								btnSave.set("disabled", false);
							}
						}
					);
				}
			} else {
				app.MessageBox({
					title: "Eingabefehler !!",
					message: "Bitte alle Felder ausfüllen"
				});
				return false;
			}
		*/
		},
		postCreate: function () {
			var g = this.eingabeGrid;
			eingabe = this.content;
			this.inherited(arguments);
			on(eingabe.BauvorhabenErfassen, "submit", function (evt) {
				// prevent the page from navigating after submit
				evt.stopPropagation();
				evt.preventDefault();
			});
			array.forEach([
				{"btn": "btnBaunrSuchen", "tb": "baunr", "col": "baunr"},
				{"btn": "btnNameSuchen", "tb": "name", "col": "name"},
				{"btn": "btnVornameSuchen", "tb": "vorname", "col": "vorname"},
				{"btn": "btnPlzSuchen", "tb": "plz", "col": "plz"},
				{"btn": "btnOrtSuchen", "tb": "ort", "col": "ort"},
				{"btn": "btnStrSuchen", "tb": "str", "col": "str"}
			], function (entry) {
				on(eingabe[entry.btn], "click", function () {
					var obj = {},
					    b = eingabe[entry.tb].get('value');
					lang.setObject(entry.col, new RegExp(b, "i"), obj);
					//lang.setObject(entry.col, b, obj);
					if (b) {
						g.set("query", obj);
					} else {
						g.set("query", {});
					}
				});
			});
		}
	});
});