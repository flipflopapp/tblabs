Ext.define('TBLabs.view.Viewport', {
    renderTo: Ext.getBody(),
    extend: 'Ext.container.Viewport',
    requires:[
        'Ext.tab.Panel',
        'Ext.toolbar.Spacer',
        'Ext.layout.container.Border'
    ],

    layout: {
        type: 'fit'
    },

    items: [
    {
        xtype: 'toolbar'
      , dock: 'top'
      , items: [
        {
            xtype: 'panel'
          , html: '<a href=#><img src="resources/images/logo.png" /></a>'
        }
       ,{
            text: 'Locate nearest center'
          , xtype: 'button'
        }
       ,{
            text: 'TB in News'
          , xtype: 'button'
        }
       ,{
            text: 'FAQ on TB'
          , xtype: 'button'
        }]
    }]
});
