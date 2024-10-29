sap.ui.define(["sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "./utilities",
    "sap/ui/core/routing/History",
    "sap/ui/model/json/JSONModel"
], function (BaseController, MessageBox, Utilities, History, JSONModel) {
    "use strict";
    return BaseController.extend("com.sap.build.standard.adminEngine.controller.DetailPage6", {
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
            this.oRouter.getTarget("DetailPage6").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
            var oView = this.getView();
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
            var that = this;
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
                    var oTable = that.byId("alcadaTable");
                    if (oTable) {
                        var oBinding = oTable.getBinding("items"),
                            aFilters = [];
                        oBinding.sOperationMode = sap.ui.model.odata.OperationMode.Server;
                        oBinding.filter(aFilters)
                    }
                }.bind(this)
            });

        },
        _onTableItemPress1: function (oEvent) {

            var oBindingContext = oEvent.getParameter("listItem").getBindingContext();
            var oObject = oEvent.getParameter("listItem").getBindingContext().getObject();

            var oComponent = this.getOwnerComponent();
            oComponent.setModel(new JSONModel(oObject), "detailData");
            return new Promise(function (fnResolve) {
                this.doNavigate("Aprovadores", oBindingContext, fnResolve, "");
            }.bind(this)).catch(function (err) {
                if (err !== undefined) {
                    MessageBox.error(err.message);
                }
            });

        },
        _onNewItem: function (oEvent) {

            var oBindingContext = "";
            var oObject = [];

            var oComponent = this.getOwnerComponent();
            oComponent.setModel(new JSONModel(oObject), "detailData");
            return new Promise(function (fnResolve) {
                this.doNavigate("Aprovadores", oBindingContext, fnResolve, "");
            }.bind(this)).catch(function (err) {
                if (err !== undefined) {
                    MessageBox.error(err.message);
                }
            });

        },
        doNavigate: function (sRouteName, oBindingContext, fnPromiseResolve, sViaRelation) {
            var sPath = (oBindingContext) ? oBindingContext.getPath() : null;
            var oModel = (oBindingContext) ? oBindingContext.getModel() : null;

            var sEntityNameSet;
            if (sPath !== null && sPath !== "") {
                if (sPath.substring(0, 1) === "/") {
                    sPath = sPath.substring(1);
                }
                sEntityNameSet = sPath.split("(")[0];
            }
            var sNavigationPropertyName;
            var sMasterContext = this.sMasterContext ? this.sMasterContext : sPath;

            if (sEntityNameSet !== null) {
                sNavigationPropertyName = sViaRelation || this.getOwnerComponent().getNavigationPropertyForNavigationWithContext(sEntityNameSet, sRouteName);
            }
            if (sNavigationPropertyName !== null && sNavigationPropertyName !== undefined) {
                if (sNavigationPropertyName === "") {
                    this.oRouter.navTo(sRouteName, {
                        context: sPath,
                        masterContext: sMasterContext
                    }, false);
                } else {
                    oModel.createBindingContext(sNavigationPropertyName, oBindingContext, null, function (bindingContext) {
                        if (bindingContext) {
                            sPath = bindingContext.getPath();
                            if (sPath.substring(0, 1) === "/") {
                                sPath = sPath.substring(1);
                            }
                        } else {
                            sPath = "undefined";
                        }

                        // If the navigation is a 1-n, sPath would be "undefined" as this is not supported in Build
                        if (sPath === "undefined") {
                            this.oRouter.navTo(sRouteName);
                        } else {
                            this.oRouter.navTo(sRouteName, {
                                context: sPath,
                                masterContext: sMasterContext
                            }, false);
                        }
                    }.bind(this));
                }
            } else {
                this.oRouter.navTo(sRouteName);
            }

            if (typeof fnPromiseResolve === "function") {
                fnPromiseResolve();
            }

        },
        onDeleteAlcada: function (oEvent) {
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
        }
    });
}, /* bExport= */ true);
