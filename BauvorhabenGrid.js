define("app/admin/BauvorhabenGrid", ["dojo/_base/declare",
	"dojo/_base/lang",
	"dgrid/OnDemandGrid",
	"dgrid/extensions/DijitRegistry",
	"dgrid/Selection",
	"dgrid/Keyboard",
	"dgrid/extensions/CompoundColumns",
	"dojo/html",
	"dojo/store/JsonRest",
	"dojo/store/Cache",
	"dojo/store/Memory",
	"dijit/form/Button",
	"dojo/dom-construct",
	"app/admin/BauvorhabenErfassen",
	"dojo/json",
	'dojo/_base/window',
	"xstyle/css!app/admin/css/bauvorhabenGrid.css",
	"dojo/domReady!"
	],
	function (declare, lang, Grid, DijitRegistry, Selection, Keyboard, CompoundColumns,
		html, JsonRest, Cache, Memory, Btn, domConstruct, BenutzerErfassen, JSON, win) {
		var app = win.global.app,
			restStore = new Cache(new JsonRest({
				target: "bauvorhaben/",
				sync: true,
				preventCache: true,
				idProperty: "id"
			}), new Memory()),
			btnAdd = new Btn({
				label: "<b>&nbsp;Neu</b>",
				iconClass: 'dijitIcon dijitIconNewTask'
			}),
			btnSave = new Btn({
				label: "<b>&nbsp;Speichern</b>",
				iconClass: 'dijitIcon dijitIconSave'
			}),
			btnAbort = new Btn({
				label: "<b>&nbsp;Abbrechen</b>",
				disabled: true,
				iconClass: 'dijitIcon dijitIconUndo'
			}),
			btnDel = new Btn({
				label: "<b>&nbsp;Löschen</b>",
				iconClass: 'dijitIcon dijitIconCut'
			}),
			formEr = new BenutzerErfassen({
				style: "height: 100%;overflow:hidden;"
			}),
			reqData = function (newId, eingabe) {
				var newObj = {
					baunr: eingabe.baunr.get('value'),
					name: eingabe.name.get('value') || "",
					vorname: eingabe.vorname.get('value') || "",
					str: eingabe.str.get('value') || "",
					plz: eingabe.plz.get('value') || "",
					ort: eingabe.ort.get('value') || ""
				};
				if (newId > 0) {lang.setObject("id", newId, newObj); }
				return JSON.stringify(newObj);
			},
			bvGrid = declare([Grid, Selection, Keyboard, DijitRegistry, CompoundColumns], {
				region: "center",
				splitter: false,
				id: "adminBauvorhabenGrid",
				deselectOnRefresh: false,
				getBeforePut: false,
				sort: "id",
				noDataMessage: "Keine Bauvorhaben gefunden",
				loadingMessage: "Daten werden eingelesen...",
				store: restStore,
				columns: [
					{ label: "Bauvorhaben verwalten", children: [
						{label: "Baunr.",	field: "baunr", sortable: false},
						{label: "Name", field: "name", sortable: false},
						{label: "Vorname", field: "vorname", sortable: false},
						{label: "PLZ", field: "plz", sortable: false},
						{label: "Ort", field: "ort", sortable: false},
						{label: "Straße", field: "str", sortable: false}
					]}
				],
				selectionMode: "single", // for Selection; only select a single row at a time
	            cellNavigation: false, // for Keyboard; allow only row-level keyboard navigation
	            pagingLinks: true,
	            pagingTextBox: true,
	            firstLastArrows: true,
				minRowsPerPage: 15,
	            rowsPerPage: 15,
	            sizeSwitch: true,
				showFooter: true,
			    pageStepper: true,
	           // gotoButton: true,
	           // maxPageStep: 14,
	           // pageSizeOptions: [15, 30, 45, 60, 75, 90],
				setHead: function (e) {
					if (this.oben) {
						html.set(this.oben, e);
					}
				},
				buildRendering: function () {
					this.inherited(arguments);
					this.actionNode =
						domConstruct.create('div', {
							className: 'dgrid-action'
						}, this.footerNode);
					this.gridFormNode =
						domConstruct.create('div', {
							className: 'dgrid-eingabe'
						}, this.headerNode, 'first');
				},
				postCreate: function () {
					var grid = this, eingabe = formEr.content;
					this.inherited(arguments);
					formEr.placeAt(this.gridFormNode);
					btnAdd.placeAt(this.actionNode);
					btnSave.placeAt(this.actionNode);
					btnAbort.placeAt(this.actionNode);
					btnDel.placeAt(this.actionNode);
					this.on("dgrid-select", function (evt) {
						var item = evt.rows[0].data;
						eingabe.editRow = item;
						eingabe.baunr.set('value', item.baunr);
						eingabe.name.set('value', item.name);
						eingabe.vorname.set('value', item.vorname);
						eingabe.str.set('value', item.str);
						eingabe.plz.set('value', item.plz);
						eingabe.ort.set('value', item.ort);
					});
					btnAdd.on("click", function () {
						eingabe.editRow = null;
						eingabe.baunr.set('value', 0);
						eingabe.name.set('value', "");
						eingabe.vorname.set('value', "");
						eingabe.str.set('value', "");
						eingabe.plz.set('value', "");
						eingabe.ort.set('value', "");
						eingabe.baunr.set("disabled", false);
						eingabe.baunr.focus();
						btnAdd.set("disabled", true);
						btnDel.set("disabled", true);
						btnAbort.set("disabled", false);
						btnSave.set("disabled", false);
					});
					btnSave.on("click", function () {
						if (eingabe.BauvorhabenErfassen.validate()) {
							if (!eingabe.editRow) {
								grid.store.put(reqData(0, eingabe));
								grid.refresh();
							} else {
								grid.store.put(reqData(eingabe.editRow.id, eingabe));
							}
						} else {
							app.MsgBox.set('content', "Bitte alle Felder ausfüllen");
							app.MsgBox.set('title', "Fehler !");
							app.MsgBox.show();
							return false;
						}
					});
					btnAbort.on("click", function () {
						eingabe.editRow = null;
						btnAdd.set("disabled", false);
						btnDel.set("disabled", false);
						btnAbort.set("disabled", true);
						btnSave.set("disabled", false);
					});
					btnDel.on("click", function () {
						var id = 0, i;
						for (i in grid.selection) {
							if (grid.selection.hasOwnProperty(i)) {
								id = i;
							}
						}
						if (id === 0) {return; }
						grid.store.remove(id);
						grid.refresh();
					});
				}
			});
		return bvGrid;
	});