sap.ui.define([
    "com/sap/build/standard/adminEngine/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History"
], function (BaseController, JSONModel, History) {
    "use strict";
    var oTokenFile;
    return BaseController.extend("com.sap.build.standard.adminEngine.controller.App", {

        onInit: function () {
            var oViewModel,
                oListSelector = this.getOwnerComponent().oListSelector,
                iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();

            //this.setModel(oViewModel, "appView");
            var sServiceUrl = "/AdmMotorRegras.comsapbuildstandardadminEngine/motor-de-regras/";
         //   var oModel = new sap.ui.model.odata.v4.ODataModel({
                /* send requests directly. Use $auto for batch request wich will be send automatically on before rendering */
          //      groupId: "$direct",
                /* I'll just quote the API documentary:
              Controls synchronization between different bindings which refer to the same data for the case data changes in one binding.
              Must be set to 'None' which means bindings are not synchronized at all; all other values are not supported and lead to an error.
              */
         //       synchronizationMode: "None",
                /*
                Root URL of the service to request data from.
                */
          //      serviceUrl: "/comsapbuildstandardadminEngine/motor-de-regras/",
                /*
                optional. Group ID that is used for update requests. If no update group ID is specified, mParameters.groupId is used.:
                updateGroupId : "$direct"
                */
         //   });
         //   var oListBinding = oModel.bindList("/BOM", undefined, undefined, undefined, { $select: "*" });
            //var oJsonModel = new sap.ui.model.json.JSONModel();
            //var oGlobalBusyDialog = new sap.m.BusyDialog(); //PREPARA UM LOAD NA TELA
         //   oListBinding.requestContexts().then(function (aContexts) {
         //       var oData = [];
          //      aContexts.forEach(function (oContext) {
         //           oData.push(oContext.getObject());
         //       });
         //   });
         //   var that = this;
            // oModel.read("/BOM?", {

            //     success: function (oData, oResponse) {
          //  that.setModel(oModel, "appView");
            //     },
            //     error: function (oError) {

            //     }
            //  });
        },
        setMode: function (sMode) {
            this.byId("idAppControl").setMode(sMode);
        }
    });
}
);
