define("app/admin/VerwaltenGrid", ["dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/number",
    "dojo/_base/window",
	"dgrid/OnDemandGrid",
	"dgrid/extensions/DijitRegistry",
	"dgrid/Selection",
	"dgrid/Keyboard",
	"dgrid/extensions/Pagination",
	"dgrid/extensions/CompoundColumns",
	"put-selector/put",
	"dojo/html",
	"dojo/store/Memory",
	"dijit/form/Button",
	"dojo/dom-construct",
	"app/admin/ArbeitsgangErfassen",
	"dojo/request",
	"dojo/json",
	"dojo/domReady!"
	],
	function (declare, lang, number, win, Grid, DijitRegistry, Selection, Keyboard, Pagination, CompoundColumns,
		put, html, Memory, Btn, domConstruct, ArbeitsgangErfassen, request, JSON) {
        var app = win.global.app,
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
			formEr = new ArbeitsgangErfassen({
				style: "height: 70px;overflow:hidden;"
			}),
			reqData = function (newId, eingabe) {
				var newObj = {
					agnr: eingabe.agnr.get('value'),
					name: eingabe.name.get('value'),
					bv_land_zwingend: eingabe.bv_land_zwingend.get('value'),
					abteilung_id: number.parse(eingabe.abteilung.get('value'), {places: 0}),
					bereich: eingabe.bereich.get('value'),
					kostenstelle: eingabe.kostenstelle.get('value'),
					la_de: eingabe.la_de.get('value'),
					la_de_ch: eingabe.la_de_ch.get('value'),
					la_ch: eingabe.la_ch.get('value')
				};
				if (newId > 0) {lang.setObject("id", newId, newObj); }
				return JSON.stringify(newObj);
			},
			verwaltenGrid =  declare([Grid, Selection, Keyboard, DijitRegistry, Pagination, CompoundColumns], {
				region: "center",
				splitter: false,
				selectionMode: "single",
				deselectOnRefresh: false,
				getBeforePut: false,
				sort: [],
				rowsPerPage: 25,
				showFooter: true,
				store : new Memory({data: [], idProperty: "id"}),
				eingabeForm : null,
				setHead: function (e) {
					if (this.oben) {
						html.set(this.oben, e);
					}
				},
				buildRendering: function () {
					this.inherited(arguments);
					var areaNode = this.actionNode =
						domConstruct.create('div', {
							className: 'dgrid-action',
							role: 'row',
							style: { overflow: 'hidden' }
						}, this.footerNode),
						gridFrom = this.gridFormNode =
						domConstruct.create('div', {
							className: 'dgrid-action',
							role: 'row',
							style: 'height: 85px;overflow: hidden'
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
						eingabe.agnr.set('value', item.agnr);
						eingabe.abteilung.set('value', item.abteilungid);
						eingabe.la_de.set('value', item.lade);
						eingabe.name.set('value', item.name);
						eingabe.bereich.set('displayedValue', item.bereich);
						eingabe.la_de_ch.set('value', item.ladech);
						eingabe.bv_land_zwingend.set('value', item.bvlandzwingend);
						eingabe.kostenstelle.set('value', item.kostenstelle);
						eingabe.la_ch.set('value', item.lach);
						btnAdd.set("disabled", false);
						btnDel.set("disabled", false);
						btnAbort.set("disabled", true);
						btnSave.set("disabled", false);
					});
					btnAdd.on("click", function () {
						eingabe.editRow = null;
						eingabe.BenutzerErfassen.reset();
						eingabe.agnr.set('disabled', false);
						eingabe.agnr.focus();
						btnAdd.set("disabled", true);
						btnDel.set("disabled", true);
						btnAbort.set("disabled", false);
						btnSave.set("disabled", false);
					});
					btnSave.on("click", function () {
						if (eingabe.BenutzerErfassen.validate()) {
							if (!eingabe.editRow) {
								if (grid.store.query({agnr: eingabe.agnr.get('value')}).total === 1) {
									app.MessageBox({
										title: "Eingabefehler !!",
										message: "Personalnummer schon vorhanden"
									});
									return;
								}
								request.post(app.RequestUrl + "arbeitsgang/add", {
									timeout: 5000,
									data: reqData(0, eingabe),
									preventCache: true,
									handleAs: "json"
								}).then(
									function (res) {
										if (res !== 0) {
											var p = grid.get('_currentPage'),
												r = grid.get('_rowsOnPage');
											if (r === grid.get('rowsPerPage')) {
												p++;
											}
											grid.store.put(res);
											grid.refresh();
											grid.select(res.id);
											grid.gotoPage(p);
											eingabe.editRow = res;
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
								request.put(app.RequestUrl + "arbeitsgang/put", {
									timeout: 5000,
									data: reqData(eingabe.editRow.id, eingabe),
									preventCache: true,
									handleAs: "json"
								}).then(
									function (res) {
										if (res !== 0) {
											var p =grid.get('_currentPage');
											grid.store.put(res);
											grid.refresh();
											grid.gotoPage(p);
											eingabe.editRow = res;
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
						if (id === 0){return;}
						request.del(app.RequestUrl + "arbeitsgang/del/" + id, {
							timeout: 5000,
							preventCache: true,
							handleAs: "json"
						}).then(
							function (res) {
								if (res !== 0) {
									var p = grid.get('_currentPage'),
										r = grid.get('_rowsOnPage');
									if (r === 1) {
										p--;
									}
									grid.store.remove(id);
									grid.refresh();
									grid.gotoPage(p);
								}
							}
						);
					});



				}
			});
		return verwaltenGrid;
	});
