sap.ui.define(["sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "./utilities",
    "sap/ui/core/routing/History"
], function (BaseController, MessageBox, Utilities, History) {
    "use strict";

    return BaseController.extend("com.sap.build.standard.adminEngine.controller.DetailPage1", {
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
            this.oRouter.getTarget("DetailPage1").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
            var oView = this.getView();
            var oModel = new sap.ui.model.odata.v4.ODataModel({
                groupId: "$direct",
                synchronizationMode: "None",
                serviceUrl: "/AdmMotorRegras.comsapbuildstandardadminEngine/motor-de-regras/",
            });
            oModel.setSizeLimit(999999999999);
            oView.setModel(oModel);
         //   var oListBinding = oModel.bindList("/Parametros", undefined, undefined, undefined, { $select: "*" });
         //   oListBinding.requestContexts().then(function (aContexts) {
                //     var oData = [];
         //       aContexts.forEach(function (oContext) {
                    //         oData.push(oContext.getObject());
         //           if (oContext.getObject().parametros == "idSla") {
         //               oView.byId("idSla").setValue(oContext.getObject().valor);
         //           } if (oContext.getObject().parametros == "idTempo") {
         //               oView.byId("idTempo").setValue(oContext.getObject().valor);
          //          }
         //       });
                //     var oModelo = new sap.ui.model.json.JSONModel({
                //         "results": oData
                //     });
                //     oView.setModel(oModelo);
         //   });
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
            var fnSuccess = function () {

                sap.m.MessageBox.show(
                    "Dados atualizados com sucesso",
                    sap.m.MessageBox.Icon.SUCCESS,
                    "Dados gravados!"
                );
            }.bind(this);

            var fnError = function (oError) {

                sap.m.MessageBox.show(
                    "Tente novamente.",
                    sap.m.MessageBox.Icon.ERROR,
                    "Erro ao atualizar os dados"
                );
            }.bind(this);
        //       var oForm = this.getView().byId("SimpleFormChange354");
 
          //  var oBinding = oForm.getBinding("binding");
               
            //this._setBusy(true); // Lock UI until submitBatch is resolved.
            this.getView().getModel().submitBatch("ParametrosGroup").then(fnSuccess, fnError);
            //this._bTechnicalErrors = false; // If there were technical errors, a new save resets them.
        },
        onLiveChange: function(oEvent){
			var sNewValue = oEvent.getParameter("value");
         //   this.byId("getValue").setText(sNewValue);
            alert("Live change!");

        }
    });
}, /* bExport= */ true);
