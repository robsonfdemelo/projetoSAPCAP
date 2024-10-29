sap.ui.define(["sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "./Dialog6",
    "./utilities",
    "sap/ui/core/routing/History",
    'sap/ui/core/util/Export',
    'sap/ui/core/util/ExportTypeCSV',
    'sap/ui/export/library',
    'sap/ui/export/Spreadsheet',
    "../libs/jszip",
    "../libs/xlsx",
    'sap/ui/model/Sorter',
    'sap/ui/model/Filter',
], function (BaseController, MessageBox, Dialog6, Utilities, History, Export, ExportTypeCSV, exportLibrary, Spreadsheet, jszipjs, xlsxjs,  Sorter, Filter) {
    "use strict";
    var EdmType = exportLibrary.EdmType;

    return BaseController.extend("com.sap.build.standard.adminEngine.controller.DetailPage3", {
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
        _onOverflowToolbarButtonPress: function (oEvent) {

            var sDialogName = "Dialog6";
            this.mDialogs = this.mDialogs || {};
            var oDialog = this.mDialogs[sDialogName];
            if (!oDialog) {
                oDialog = new Dialog6(this.getView());
                this.mDialogs[sDialogName] = oDialog;

                // For navigation.
                oDialog.setRouter(this.oRouter);

            } else {
                this.getView().byId("idLogin").setValue("");
                this.getView().byId("idEpo").setValue("");
                this.getView().byId("idNomeEpo").setValue("");
            }

            var context = oEvent.getSource().getBindingContext();
            oDialog._oControl.setBindingContext(context);

            oDialog.open();

        },
        onInit: function () {
            this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            this.oRouter.getTarget("DetailPage3").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
            var oView = this.getView();

            var oModel = new sap.ui.model.odata.v4.ODataModel({
                groupId: "$direct",
                synchronizationMode: "None",
                serviceUrl: "/AdmMotorRegras.comsapbuildstandardadminEngine/work-order/", 
            });
           // oModel.setSizeLimit(999999999999);
            oView.setModel(oModel);
            //  var oListBinding = oModel.bindList("/TecnicoPorEPO", undefined, undefined, undefined, { $select: "loginTecnico" });
            //  var count = 0;
            //   oListBinding.requestContexts().then(function (aContexts) {
            //     var oData = [];
            //      aContexts.forEach(function (oContext) {
            //         oData.push(oContext.getObject());
            //          count = count + 1;
            //      });
            //     var oModelo = new sap.ui.model.json.JSONModel({
            //         "results": oData
            //     });
            //     oView.setModel(oModelo);
            //      count = "Items (" + count + ")";
            //       oView.byId("titleCount").setText(count);
            //   });       

            var that = this;
            that.customTecnicoFilter = [];
            that.customFornecedorFilter = [];

            oView.getController().setHeaderContext();
            oView.addEventDelegate({
                onBeforeShow: function () {
                    if (sap.ui.Device.system.phone) {
                        var oPage = oView.getContent()[0];
                        if (oPage.getShowNavButton && !oPage.getShowNavButton()) {
                            oPage.setShowNavButton(true);
                            oPage.attachNavButtonPress(function () {
                                this.oRouter.navTo("MasterPage1", {}, true);
                            }.bind(this));
                        }
                    }
                }.bind(this)
            });

        },
        onSave: function () {
            var that = this;
            var fnSuccess = function () {

                sap.m.MessageBox.show(
                    "Dados atualizados com sucesso",
                    sap.m.MessageBox.Icon.SUCCESS,
                    "Dados gravados!"
                );

                that.getView().getController().setHeaderContext();
            }.bind(this);

            var fnError = function (oError) {

                sap.m.MessageBox.show(
                    "Tente novamente.",
                    sap.m.MessageBox.Icon.ERROR,
                    "Erro ao atualizar os dados"
                );
            }.bind(this);

            //this._setBusy(true); // Lock UI until submitBatch is resolved.
            this.getView().getModel().submitBatch("TecGroup").then(fnSuccess, fnError);
            //this._bTechnicalErrors = false; // If there were technical errors, a new save resets them.
        },
        onResetChanges: function () {
            this.byId("TecTable").getBinding("items").resetChanges();

        },
        onDelete: function (oEvent) {
            //var oSelected = this.byId("bomTable").getSelectedItem();
            var that = this;
            var oList = oEvent.getSource(),
                oItem = oEvent.getParameter("listItem");
            if (oItem) {
                oItem.getBindingContext().delete("$auto").then(function () {
                    //     window.alert("deu certo");
                    sap.m.MessageBox.show(
                        "Registro excluido com sucesso!",
                        sap.m.MessageBox.Icon.SUCCESS,
                        "Dados gravados!"
                    );
                    that.getView().getController().setHeaderContext();
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
        createColumnConfig: function () {
            var aCols = [];

            aCols.push({
                // label: 'Tipo de Inst.',
                property: 'loginTecnico',
                type: EdmType.String
            });

            aCols.push({
                //  label: 'ID Tipo de OS',
                property: 'CodFornecedorSAP',
                type: EdmType.String
            });

            aCols.push({
                property: 'nomeFornecedor',
                type: EdmType.String
            });

            return aCols;
        },
        onExportOdataV4: function () {
            var aCols, oRowBinding, oSettings, oSheet, oTable;

            if (!this._oTable) {
                this._oTable = this.byId('TecTable');
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
                fileName: 'TEC por WO export.xlsx',
                worker: false // We need to disable worker because we are using a MockServer as OData Service
            };

            oSheet = new Spreadsheet(oSettings);
            oSheet.build().finally(function () {
                oSheet.destroy();
            });
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
                        TecnicoPorEPO: excelData
                    });
                    var oModelData = oModelo.getProperty("/");
                    var oColumns = Object.keys(oModelData["TecnicoPorEPO"][0]);
                    if (oColumns[0] == "loginTecnico" &&
                        oColumns[1] == "CodFornecedorSAP" &&
                        oColumns[2] == "nomeFornecedor") {



                        // var oList = this_.byId("projectList"),
                       // var oTable = that.byId("TecTable");
                        //                     oTable.bindAggregation("items", {
                        //		path: '/BOM',
                        //		parameters: {
                        //            $expand: 'tipoOs,materiais',
                        //			$count: true,
                        //			$$updateGroupId: 'BOMGroup'
                        //		},
                        //		template: that.byId("columnListItem").clone()
                        //	});
                        // var oBinding = oTable.getBinding("items");

                        var oGlobalBusyDialog = new sap.m.BusyDialog();
                        oGlobalBusyDialog.open();                      
                        var oModel = new sap.ui.model.odata.v4.ODataModel({
                            groupId: "$direct",
                            synchronizationMode: "None",
                            serviceUrl: "/AdmMotorRegras.comsapbuildstandardadminEngine/work-order/",
                        });
                        var oListBinding = oModel.bindList("/importTecnicoPorEPO ", undefined, undefined, undefined, { $$updateGroupId: "tecEpoExcel" });

                        sap.ui.getCore().getMessageManager().removeAllMessages();
                        oListBinding.attachCreateCompleted(function (oEvent) {
                            oGlobalBusyDialog.close();
                            if (oEvent.getParameter("success")) {
                                MessageBox.show(
                                    "Dados importados com sucesso", {
                                    icon: MessageBox.Icon.SUCCESS,
                                    title: "Dados gravados!",
                                    onClose: function (oAction) {
                                        var oTable = that.getView().byId("TecTable"),
                                            oBinding = oTable.getBinding("items"),
                                            aFilters = [];
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
                                that.byId("TecTable").getBinding("items").resetChanges();
                                //   sap.ui.getCore().getMessageManager().removeAllMessages();
                            }
                        }.bind(this));
                        //var  oContext = "";
                        var oData = [];
                        $.each(excelData, function (index, value) {
                            oData.push({
                                "loginTecnico": value.loginTecnico,
                                "CodFornecedorSAP": value.CodFornecedorSAP
                            });
                        });
                        var oContext = oListBinding.create({
                            "tecnico": oData}, true);

                        if (excelData.length > 0) {
                            //that.onSave();
                            oModel.submitBatch("tecEpoExcel");
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
        setHeaderContext: function () {
            var oView = this.getView();
            oView.byId("titleCount").setBindingContext(
                oView.byId("TecTable").getBinding("items").getHeaderContext());
        },
        handleFilterButtonPressed: function () {
            if (!this.DialogFilter) {
                this.DialogFilter = this.DialogFilter = sap.ui.xmlfragment(
                    "DialogFilterTecFor",
                    "com.sap.build.standard.adminEngine.view.FilterDialogTecFor",
                    this
                );
                //to get access to the global model
                this.getView().addDependent(this.DialogFilter);
                //this.DialogFilter.getModel().setSizeLimit(999999); -> remoção
            }
            // abre o value help dialog filtrando pelo input value
            this.DialogFilter.open();
        },
        handleFilterDialogConfirm: function (oEvent) {
            var oTable = this.byId("TecTable"),
                mParams = oEvent.getParameters(),
                oBinding = oTable.getBinding("items"),
                aFilters = [];

            //  if (userAdm === "X") {
            //     var oFilter = new sap.ui.model.Filter("user", sap.ui.model.FilterOperator.EQ, "admin");
            //      aFilters.push(oFilter);
            //   }
            
            // mParams.filterItems.forEach(function (oItem) {
            //     var oFilter = new sap.ui.model.Filter(oItem.getKey(), sap.ui.model.FilterOperator.EQ, oItem.getText());
            //     aFilters.push(oFilter)
            // });

            if (this.customFornecedorFilter) {
                this.customFornecedorFilter.forEach((fornecedor) => {
                    // @ts-ignore
                    var oFilter = new sap.ui.model.Filter("CodFornecedorSAP", sap.ui.model.FilterOperator.EQ, fornecedor);
                    aFilters.push(oFilter);
                });
            }

            if (this.customTecnicoFilter) {
                this.customTecnicoFilter.forEach((tecnico) => {
                    // @ts-ignore
                    var oFilter = new sap.ui.model.Filter("loginTecnico", sap.ui.model.FilterOperator.EQ, tecnico);
                    aFilters.push(oFilter);
                });
            }

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
                    "DialogSortTecFor",
                    "com.sap.build.standard.adminEngine.view.ViewSettingsDialogTec",
                    this
                );
                //to get access to the global model
                this.getView().addDependent(this.DialogSort);
            }
            // abre o value help dialog filtrando pelo input value
            this.DialogSort.open();
        },

        handleSortDialogConfirm: function (oEvent) {
            var oTable = this.byId("TecTable"),
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
        },


        onSearchTecnico: function(oEvent){
            var aFilters = [];
            var sQuery = oEvent.getSource().getValue();
            if (sQuery && sQuery.length > 3) {
                var filter = new Filter("loginTecnico", sap.ui.model.FilterOperator.Contains, sQuery);
                aFilters.push(filter);

                // update list binding
                // @ts-ignore
                var oBinding = sap.ui.core.Fragment.byId("DialogFilterTecFor", "TecnicoCustomList").getBinding("items")
                oBinding.sOperationMode = sap.ui.model.odata.OperationMode.Server;
                oBinding.filter(aFilters);
            } else if (sQuery.length == 0) {
                // @ts-ignore
                var oBinding = sap.ui.core.Fragment.byId("DialogFilterTecFor", "TecnicoCustomList").getBinding("items")
                oBinding.sOperationMode = sap.ui.model.odata.OperationMode.Server;
                oBinding.filter(aFilters);
            }
        },

        onSelectionChangeTecnico: function(oEvent){

            var bSelected = oEvent.getParameter('selected');

            if (!this.customTecnicoFilter) {
                this.customTecnicoFilter = [];
            }

            var oList = oEvent.getSource();

            if (bSelected) {
                oList.getSelectedContexts().forEach((tecnico) => {
                    this.customTecnicoFilter.push(tecnico.getProperty("loginTecnico"))
                })
            } else {
                let sValueDel = oEvent.getParameter('listItem').getTitle();
                this.customTecnicoFilter = this.customTecnicoFilter.filter(element => element !== sValueDel);
            }

            if (this.customTecnicoFilter.length > 0) {
                var oCustomFilter = sap.ui.core.Fragment.byId("DialogFilterTecFor", "customTecnico")
                // @ts-ignore
                oCustomFilter.setFilterCount(this.customTecnicoFilter.length);
                // @ts-ignore
                oCustomFilter.setSelected(true);
            } else {
                this.customTecnicoFilter = [];
            }

        },

        onSearchFornecedor: function(oEvent){

            var aFilters = [];
            var sQuery = oEvent.getSource().getValue();
            if (sQuery && sQuery.length > 3) {
                var filter = new Filter("CodFornecedorSAP", sap.ui.model.FilterOperator.Contains, sQuery);
                aFilters.push(filter);

                // update list binding
                // @ts-ignore
                var oBinding = sap.ui.core.Fragment.byId("DialogFilterTecFor", "FornecedorCustomList").getBinding("items")
                oBinding.sOperationMode = sap.ui.model.odata.OperationMode.Server;
                oBinding.filter(aFilters);
            } else if (sQuery.length == 0) {
                // @ts-ignore
                var oBinding = sap.ui.core.Fragment.byId("DialogFilterTecFor", "FornecedorCustomList").getBinding("items")
                oBinding.sOperationMode = sap.ui.model.odata.OperationMode.Server;
                oBinding.filter(aFilters);
            }

        },

        onSelectionChangeFornecedor: function(oEvent){

            var bSelected = oEvent.getParameter('selected');

            if (!this.customFornecedorFilter) {
                this.customFornecedorFilter = [];
            }

            var oList = oEvent.getSource();

            if (bSelected) {
                oList.getSelectedContexts().forEach((fornecedor) => {
                    this.customFornecedorFilter.push(fornecedor.getProperty("CodFornecedorSAP"))
                })
            } else {
                let sValueDel = oEvent.getParameter('listItem').getTitle();
                this.customFornecedorFilter = this.customFornecedorFilter.filter(element => element !== sValueDel);
            }

            if (this.customFornecedorFilter.length > 0) {
                var oCustomFilter = sap.ui.core.Fragment.byId("DialogFilterTecFor", "customFornecedor")
                // @ts-ignore
                oCustomFilter.setFilterCount(this.customFornecedorFilter.length);
                // @ts-ignore
                oCustomFilter.setSelected(true);
            } else {
                this.customFornecedorFilter = [];
            }
            
        },

        onResetFilters: function (oEvent){

            // @ts-ignore
            sap.ui.core.Fragment.byId("DialogFilterTecFor", "TecnicoCustomList").removeSelections();
            this.customTecnicoFilter = [];

            sap.ui.core.Fragment.byId("DialogFilterTecFor", "FornecedorCustomList").removeSelections();
            this.customFornecedorFilter = []

            var oCustomFilter1 = sap.ui.core.Fragment.byId("DialogFilterTecFor", "customTecnico");
            var oCustomFilter2 = sap.ui.core.Fragment.byId("DialogFilterTecFor", "customFornecedor");

            // @ts-ignore
            oCustomFilter1.setFilterCount(0);
            // @ts-ignore
            oCustomFilter1.setSelected(false);

            // @ts-ignore
            oCustomFilter2.setFilterCount(0);
            // @ts-ignore
            oCustomFilter2.setSelected(false);

        }

    });
}, /* bExport= */ true);
