sap.ui.define(["sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "./utilities",
    "sap/ui/core/routing/History",
    'sap/ui/core/util/Export',
    'sap/ui/core/util/ExportTypeCSV',
    'sap/ui/export/library',
    'sap/ui/export/Spreadsheet',
    "./Dialog9",
    "../libs/jszip",
    "../libs/xlsx",
    'sap/ui/model/Sorter',
    'sap/ui/model/Filter'
], function (BaseController, MessageBox, Utilities, History, Export, ExportTypeCSV, exportLibrary, Spreadsheet, Dialog9, jszipjs, xlsxjs, Sorter, Filter) {
    "use strict";
    var EdmType = exportLibrary.EdmType;
    var excelImported = "";
    return BaseController.extend("com.sap.build.standard.adminEngine.controller.Aprovadores", {
        handleRouteMatched: function (oEvent) {
            var sAppId = "App5f74baded5dbc32ead99b868";

            var oParams = {};

            if (oEvent.mParameters.data.context) {
                this.sContext = oEvent.mParameters.data.context;

            } else {
                if (this.getOwnerComponent().getComponentData()) {
                    var patternConvert = function (oParam) {
                        if (Object.keys(oParam).length !== 0) {
                            for (var prop in oParam) {
                                if (prop !== "sourcePrototype" && prop.includes("Set")) {
                                    return prop + "(" + oParam[prop][0] + ")";
                                }
                            }
                        }
                    };

                    this.sContext = patternConvert(this.getOwnerComponent().getComponentData().startupParameters);

                }
            }

            var oPath;

            if (this.sContext) {
                oPath = {
                    path: "/" + this.sContext,
                    parameters: oParams
                };
                this.getView().bindObject(oPath);
            }

        },
        onInit: function () {
            this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            this.oRouter.getTarget("Aprovadores").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
            var oView = this.getView();
            var that = this;
            var sampleModel = new sap.ui.model.json.JSONModel();
            oView.setModel(sampleModel, "sampleModel");

            var columnModel = new sap.ui.model.json.JSONModel();
            oView.setModel(columnModel, "columnModel");
            //this.localModel = new sap.ui.model.json.JSONModel();
            //this.getView().setModel(this.localModel, "/BOM");

            var oModel = new sap.ui.model.odata.v4.ODataModel({
                groupId: "$direct",
                synchronizationMode: "None",
                serviceUrl: "/AdmMotorRegras.comsapbuildstandardadminEngine/workflow/",
            });
            //  oModel.setSizeLimit(999999999999);
            oView.setModel(oModel);
            oView.addEventDelegate({
                onBeforeShow: function () {
                    if (sap.ui.Device.system.phone) {
                        var oPage = oView.getContent()[0];
                        if (oPage.getShowNavButton && !oPage.getShowNavButton()) {
                            oPage.setShowNavButton(true);
                            oPage.attachNavButtonPress(function () {
                                this.oRouter.navTo("DetailPage6", {}, true);
                            }.bind(this));
                        }
                    }

                    this.getView().byId("alcadaInput").setValueStateText("");
                    this.getView().byId("alcadaInput").setValueState("None");
                    var oTable = this.byId("aprovadoresTable"),
                        oBinding = oTable.getBinding("items"),
                        aFilters = [];
                    var oContainer = that.getOwnerComponent().getModel("detailData").getProperty("/");
                    if (oContainer.alcada) {
                        this.byId("alcadaInput").setValue(oContainer.alcada);
                        this.byId("percentInput").setValue(oContainer.percentual);
                        // this.byId("fornecInput").setValue("");
                        this.byId("alcadaInput").setEnabled(false);
                        // this.byId("fornecInput").setEnabled(false);
                        var oFilter = new sap.ui.model.Filter("alcada", sap.ui.model.FilterOperator.EQ, oContainer.alcada);
                        aFilters.push(oFilter);
                        var oFilter = new sap.ui.model.Filter("fornecedorSAP", sap.ui.model.FilterOperator.EQ, this.byId("fornecInput").getValue());
                        aFilters.push(oFilter);
                        oBinding.sOperationMode = sap.ui.model.odata.OperationMode.Server;
                        oBinding.filter(aFilters);
                        this.onSearch();
                    } else {
                        this.byId("alcadaInput").setValue("");
                        this.byId("percentInput").setValue("");
                        // this.byId("fornecInput").setValue("");
                        this.byId("alcadaInput").setEnabled(true);
                        //  this.byId("fornecInput").setEnabled(true);
                        var oFilter = new sap.ui.model.Filter("alcada", sap.ui.model.FilterOperator.EQ, "newData");
                        aFilters.push(oFilter);
                        oBinding.sOperationMode = sap.ui.model.odata.OperationMode.Server;
                        oBinding.filter(aFilters);
                    }
                }.bind(this)
            });

        },
        _onPageNavButtonPress: function () {
            //   var oHistory = History.getInstance();
            // var sPreviousHash = oHistory.getPreviousHash();
            // var oQueryParams = this.getQueryParameters(window.location);
            // this.onResetChanges();
            // if (sPreviousHash !== undefined || oQueryParams.navBackToLaunchpad) {
            window.history.go(-1);
            // } else {
            //     var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            //    oRouter.navTo("DetailPage6", true);
            //}

        },
        _onOverflowToolbarButtonPress: function (oEvent) {
            if (this.getView().byId("alcadaInput").getValue == "") {
                sap.m.MessageBox.show(
                    "Antes de adicionar um aprovador por favor preencha o campo Alçada",
                    sap.m.MessageBox.Icon.ERROR,
                    "Erro ao inserir os dados"
                )
            } else {
                var sDialogName = "Dialog9";
                this.mDialogs = this.mDialogs || {};
                var oDialog = this.mDialogs[sDialogName];
                if (!oDialog) {
                    oDialog = new Dialog9(this.getView());
                    this.mDialogs[sDialogName] = oDialog;

                    // For navigation.
                    oDialog.setRouter(this.oRouter);

                } else {
                    this.getView().byId("idUser").setValue("");
                }

                var context = oEvent.getSource().getBindingContext();
                oDialog._oControl.setBindingContext(context);

                oDialog.open();
            }
        },
        onSave: function () {
            if (this.getView().byId("alcadaInput").getValue() == "") {
                this.getView().byId("alcadaInput").setValueStateText("Campo obrigatório");
                this.getView().byId("alcadaInput").setValueState("Error");
                sap.m.MessageBox.show(
                    "Antes de salvar preencha o campo Alçada",
                    sap.m.MessageBox.Icon.ERROR,
                    "Erro ao inserir os dados"
                )
            } else {
                var oModel = new sap.ui.model.odata.v4.ODataModel({
                    groupId: "$direct",
                    synchronizationMode: "None",
                    serviceUrl: "/AdmMotorRegras.comsapbuildstandardadminEngine/workflow/",
                });
                var oListBinding = oModel.bindList("/AlcadasAprovacao", undefined, undefined, undefined, { $$updateGroupId: "alcadasGroup" });
                var that = this;
                var oGlobalBusyDialog = new sap.m.BusyDialog();
                oGlobalBusyDialog.open();
                sap.ui.getCore().getMessageManager().removeAllMessages();
                oListBinding.attachCreateCompleted(function (oEvent) {
                    oGlobalBusyDialog.close();
                    if (oEvent.getParameter("success")) {
                        MessageBox.show(
                            "Dados atualizados com sucesso", {
                            icon: MessageBox.Icon.SUCCESS,
                            title: "Dados gravados!",
                            onClose: function (oAction) {

                            }
                        }
                        );
                    } else {
                        sap.m.MessageBox.show(
                            sap.ui.getCore().getMessageManager().getMessageModel().getData()[0].message,
                            sap.m.MessageBox.Icon.ERROR,
                            "Erro ao atualizar os dados"
                        );
                        oListBinding.resetChanges();
                        //sap.ui.getCore().getMessageManager().removeAllMessages();
                    }
                }.bind(this));
                var oContext = oListBinding.create({
                    "alcada": that.getView().byId("alcadaInput").getValue(),
                    //  "fornecedorSAP": that.getView().byId("fornecInput").getValue(),
                    "percentual": parseInt(that.getView().byId("percentInput").getValue(), 0)
                });
                oModel.submitBatch("alcadasGroup");
            }
        },
        onDelete: function (oEvent) {
            //var oSelected = this.byId("bomTable").getSelectedItem();
            var oList = oEvent.getSource(),
                oItem = oEvent.getParameter("listItem");
            var that = this;
            if (oItem) {
                oItem.getBindingContext().delete("$auto").then(function () {
                    //   window.alert("deu certo");
                    sap.m.MessageBox.show(
                        "Registro excluido com sucesso!",
                        sap.m.MessageBox.Icon.SUCCESS,
                        "Dados gravados!"
                    );
                    // that.getView().getController().setHeaderContext();
                }.bind(this), function (oError) {
                    //  window.alert("deu erro");
                    sap.m.MessageBox.show(
                        "Tente novamente.",
                        sap.m.MessageBox.Icon.ERROR,
                        "Erro ao deletar o registro."
                    );
                });
            }
        },
        handleValueHelp: function (oEvent) {
            var oModel = new sap.ui.model.odata.v4.ODataModel({
                groupId: "$direct",
                synchronizationMode: "None",
                serviceUrl: "/AdmMotorRegras.comsapbuildstandardadminEngine/motor-de-regras/",
            });
            this.inputId = oEvent.getSource().getId();
            // cria o value help dialog
            if (!this.DialogFornecedor2) {
                this.DialogFornecedor2 = this.DialogFornecedor2 = sap.ui.xmlfragment(
                    "DialogFornecedor2",
                    "com.sap.build.standard.adminEngine.view.DialogFornecedor",
                    this
                );
                //to get access to the global model
                this.getView().addDependent(this.DialogFornecedor2);
                sap.ui.core.Fragment.byId("DialogFornecedor2", "List").setModel(oModel);
            } else {
                var aFilters = []
                var oBind = sap.ui.core.Fragment.byId("DialogFornecedor2", "List").getBinding("items");
                oBind.sOperationMode = sap.ui.model.odata.OperationMode.Server;
                oBind.filter(aFilters, sap.ui.model.FilterType.Application);
            }
            //var oJsonModel = new sap.ui.model.json.JSONModel();
            // abre o value help dialog filtrando pelo input value
            this.DialogFornecedor2.open();
            //	oGlobalBusyDialog.open();
        },
        _handleValueHelpSearch: function (evt) {
            var sValue = evt.getParameter("value").toUpperCase();
            var filter = new sap.ui.model.Filter({
                filters: [
                    new sap.ui.model.Filter("fornecedor", sap.ui.model.FilterOperator.Contains, sValue),
                    new sap.ui.model.Filter("nomeFornecedor", sap.ui.model.FilterOperator.Contains, sValue)
                ],
                and: false
            })
            //var FilternomeFornecedor = new sap.ui.model.Filter("nomeFornecedor", sap.ui.model.FilterOperator.Contains, sValue);
            var oBind = sap.ui.core.Fragment.byId("DialogFornecedor2", "List").getBinding("items");
            oBind.sOperationMode = sap.ui.model.odata.OperationMode.Server;
            oBind.filter(filter, sap.ui.model.FilterType.Application);
            //evt.getSource().getBinding("items").filter([FilterdescricaoOs]);
        },
        _handleValueHelpClose: function (evt) {
            var oSelectedItem = evt.getParameter("selectedItem");
            var that = this;
            if (oSelectedItem) {
                //var arrayId = that.inputId.split("TpOS");
                // var idTpOs = arrayId[0] + "TpOS";
                that.getView().byId(that.inputId).setValue(oSelectedItem.getDescription());
                that.getView().byId("fornecInput").setValue(oSelectedItem.getTitle());
                that.onSearch();
            }
            //evt.getSource().getBinding("items").filter([]);
        }, onSearch: function () {

            var oTable = this.byId("aprovadoresTable"),
                oBinding = oTable.getBinding("items"),
                aFilters = [];
            var oFilter = new sap.ui.model.Filter("alcada", sap.ui.model.FilterOperator.EQ, this.byId("alcadaInput").getValue());
            aFilters.push(oFilter);
            //var oFilter = new sap.ui.model.Filter("fornecedorSAP", sap.ui.model.FilterOperator.EQ, this.byId("fornecInput").getValue());
            // aFilters.push(oFilter);
            oBinding.sOperationMode = sap.ui.model.odata.OperationMode.Server;
            oBinding.filter(aFilters);

            if (this.DialogFilter) {
                var aFilters = [];
                var filter = new sap.ui.model.Filter("alcada", sap.ui.model.FilterOperator.EQ, this.getView().byId("alcadaInput").getValue());
                aFilters.push(filter);

                var oBinding = sap.ui.core.Fragment.byId("DialogFilter", "fornecedorSAPFilter").getBinding("items");
                oBinding.sOperationMode = sap.ui.model.odata.OperationMode.Server;
                oBinding.filter(aFilters);

                var oBinding = sap.ui.core.Fragment.byId("DialogFilter", "userFilter").getBinding("items");
                oBinding.sOperationMode = sap.ui.model.odata.OperationMode.Server;
                oBinding.filter(aFilters);
            }
        },
        onUpload: function (e) {
            this._import(e.getParameter("files") && e.getParameter("files")[0]);
        },

        _import: function (file) {
            var that = this;
            var excelData = {};
            if (file && window.FileReader) {
                var reader = new FileReader();
                reader.onload = function (e) {
                    var data = e.target.result;
                    var workbook = XLSX.read(data, {
                        type: 'binary'
                    });
                    workbook.SheetNames.forEach(function (sheetName) {
                        // Here is your object for every sheet in workbook
                        excelData = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);

                    });
                    // Setting the data to the local model 
                    //	that.localModel.setData({
                    //		BOM: excelData
                    //	});
                    //	that.localModel.refresh(true);
                    var oModelo = new sap.ui.model.json.JSONModel({
                        Aprovadores: excelData
                    });
                    var oModelData = oModelo.getProperty("/");
                    var oColumns = Object.keys(oModelData["Aprovadores"][0]);
                    if (oColumns[0] == "fornecedorSAP" &&
                        oColumns[1] == "user") {
                        var oGlobalBusyDialog = new sap.m.BusyDialog();
                        oGlobalBusyDialog.open();
                        var oModel = that.getView().getModel();
                        var oListBinding = oModel.bindList("/importAprovadores", undefined, undefined, undefined, { $$updateGroupId: "aprovadoresExcel" });

                        sap.ui.getCore().getMessageManager().removeAllMessages();
                        oListBinding.attachCreateCompleted(function (oEvent) {
                            oGlobalBusyDialog.close();
                            if (oEvent.getParameter("success")) {
                                MessageBox.show(
                                    "Dados importados com sucesso", {
                                    icon: MessageBox.Icon.SUCCESS,
                                    title: "Dados gravados!",
                                    onClose: function (oAction) {
                                        var oTable = that.getView().byId("aprovadoresTable"),
                                            oBinding = oTable.getBinding("items"),
                                            aFilters = [];

                                        var oFilter = new sap.ui.model.Filter("alcada", sap.ui.model.FilterOperator.EQ, that.getView().byId("alcadaInput").getValue());
                                        aFilters.push(oFilter);
                                        oBinding.sOperationMode = sap.ui.model.odata.OperationMode.Server;
                                        oBinding.filter(aFilters);

                                    }
                                }
                                );
                            } else {
                                sap.m.MessageBox.show(
                                    sap.ui.getCore().getMessageManager().getMessageModel().getData()[0].message,
                                    sap.m.MessageBox.Icon.ERROR,
                                    "Erro ao realizar o upload!"
                                );
                                that.byId("aprovadoresTable").getBinding("items").resetChanges();
                                that.getView().getModel().resetChanges("aprovadoresExcel");
                                //   sap.ui.getCore().getMessageManager().removeAllMessages();
                            }
                        }.bind(this));
                        //var  oContext = "";
                        var oData = [];
                        var aprov = false;
                        $.each(excelData, function (index, value) {
                            oData.push({
                                "alcada": that.getView().byId("alcadaInput").getValue(),
                                "fornecedorSAP": value.fornecedorSAP,
                                "user": value.user
                            });
                        });
                        var oContext = oListBinding.create({
                            "Aprovadores": oData
                        }, true);

                        if (excelData.length > 0) {
                            //that.onSave();
                            that.getView().getModel().submitBatch("aprovadoresExcel");
                        }
                    } else {
                        sap.m.MessageBox.show(
                            "O Layout do arquivo está incorreto. Realize o download e tente novamente.",
                            sap.m.MessageBox.Icon.ERROR,
                            "Erro no upload do arquivo"
                        );
                    }
                };
                reader.onerror = function (ex) {
                    console.log(ex);
                };
                reader.readAsBinaryString(file);
            }
        },
        onExport: function () {
            //    if (excelImported == "") {
            this.onExportOdataV4();
            //   } else {
            //       this.onExportJson();
            //   };
        },
        onExportOdataV4: function () {
            var aCols, oRowBinding, oSettings, oSheet, oTable;

            if (!this._oTable) {
                this._oTable = this.byId('aprovadoresTable');
            }

            oTable = this._oTable;
            oRowBinding = oTable.getBinding('items');

            aCols = this.createColumnConfig();

            var oModel = oRowBinding.getModel();

            oSettings = {
                workbook: {
                    columns: aCols,
                    hierarchyLevel: 'Level'
                },
                dataSource: {
                    type: 'odata',
                    dataUrl: oRowBinding.getDownloadUrl ? oRowBinding.getDownloadUrl() : null,
                    serviceUrl: this._sServiceUrl,
                    headers: oModel.getHttpHeaders ? oModel.getHttpHeaders() : null,
                    count: oRowBinding.getLength ? oRowBinding.getLength() : null,
                    useBatch: true, // Default for ODataModel V2
                    sizeLimit: 1000
                },
                fileName: 'Aprovadores export.xlsx',
                worker: false // We need to disable worker because we are using a MockServer as OData Service
            };

            oSheet = new Spreadsheet(oSettings);
            oSheet.build().finally(function () {
                oSheet.destroy();
            });
        },
        createColumnConfig: function () {
            var aCols = [];

            aCols.push({
                // label: 'Tipo de Inst.',
                property: 'fornecedorSAP',
                type: EdmType.String
            });

            aCols.push({
                //  label: 'ID Tipo de OS',
                property: 'user',
                type: EdmType.String
            });
            return aCols;
        },

        handleFilterButtonPressed: function () {
            if (!this.DialogFilter) {
                this.DialogFilter = this.DialogFilter = sap.ui.xmlfragment(
                    "DialogFilter",
                    "com.sap.build.standard.adminEngine.view.ViewSettingsDialog1",
                    this
                );
                //to get access to the global model
                this.getView().addDependent(this.DialogFilter);
                this.DialogFilter.setModel(this.getView().getModel());

                this.DialogFilter.getModel().setSizeLimit(500);

                this.getView().addDependent(this.DialogFilter);

                var aFilters = [];
                var filter = new sap.ui.model.Filter("alcada", sap.ui.model.FilterOperator.EQ, this.getView().byId("alcadaInput").getValue());
                aFilters.push(filter);

                var oBinding = sap.ui.core.Fragment.byId("DialogFilter", "fornecedorSAPFilter").getBinding("items");
                oBinding.sOperationMode = sap.ui.model.odata.OperationMode.Server;
                oBinding.filter(aFilters);

                var oBinding = sap.ui.core.Fragment.byId("DialogFilter", "userFilter").getBinding("items");
                oBinding.sOperationMode = sap.ui.model.odata.OperationMode.Server;
                oBinding.filter(aFilters);

            }
            // abre o value help dialog filtrando pelo input value
            this.DialogFilter.open();
        },

        handleFilterDialogConfirm: function (oEvent) {
            var oTable = this.byId("aprovadoresTable"),
                mParams = oEvent.getParameters(),
                oBinding = oTable.getBinding("items"),
                aFilters = [];
            mParams.filterItems.forEach(function (oItem) {
                var oFilter = new sap.ui.model.Filter(oItem.getKey(), sap.ui.model.FilterOperator.EQ, oItem.getText());
                aFilters.push(oFilter);

                //	oFilter = new Filter(sPath, sOperator, sValue1, sValue2);

            });
            var filter = new sap.ui.model.Filter("alcada", sap.ui.model.FilterOperator.EQ, this.getView().byId("alcadaInput").getValue());
            aFilters.push(filter);

            // apply filter settings
            oBinding.sOperationMode = sap.ui.model.odata.OperationMode.Server;
            oBinding.filter(aFilters);

            // update filter bar
            this.byId("vsdFilterBar").setVisible(aFilters.length > 0);
            this.byId("vsdFilterLabel").setText(mParams.filterString);
        },
        handleSortButtonPressed: function () {
            if (!this.DialogSort) {
                this.DialogSort = this.DialogSort = sap.ui.xmlfragment(
                    "DialogSort",
                    "com.sap.build.standard.adminEngine.view.ViewSettingsDialog2",
                    this
                );
                //to get access to the global model
                this.getView().addDependent(this.DialogSort);
            }
            // abre o value help dialog filtrando pelo input value
            this.DialogSort.open();
        },

        handleSortDialogConfirm: function (oEvent) {
            var oTable = this.byId("aprovadoresTable"),
                mParams = oEvent.getParameters(),
                oBinding = oTable.getBinding("items"),
                sPath,
                bDescending,
                aSorters = [];

            sPath = mParams.sortItem.getKey();
            bDescending = mParams.sortDescending;
            aSorters.push(new Sorter(sPath, bDescending));
            oBinding.sOperationMode = sap.ui.model.odata.OperationMode.Server;
            // apply the selected sort and group settings
            oBinding.sort(aSorters);
        }
    });
}, /* bExport= */ true);
