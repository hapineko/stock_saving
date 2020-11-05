var setting = {
  selector: {
    trigger: '.js-viewSwitch-trigger',
    target: '.js-viewSwitch-target'
  },
  data: {
    targetId: 'view-switch-target-id',
    layerNum: 'view-switch-layer-num'
  }
}

var ViewSwitch = function () { }

ViewSwitch.prototype.show = function (TARGET_ID) {
  $(TARGET_ID).stop(true).slideDown();
};
ViewSwitch.prototype.hide = function (TARGET_ID) {
  var LAYER_NUM = $(TARGET_ID).data(setting.data.layerNum);
  $('[data-' + setting.data.layerNum + '=' + LAYER_NUM + ']:visible').find(setting.selector.target).hide();
  $('[data-' + setting.data.layerNum + '=' + LAYER_NUM + ']:visible').stop(true).slideUp();
};

// オブジェクトの生成
var AnswerSwitch = new ViewSwitch();

// イベントの付与
$(setting.selector.trigger).each(function () {
  $(this).on('click.ViewSwitch', function () {
    var TARGET_ID = '#' + $(this).data(setting.data.targetId);
    AnswerSwitch.hide(TARGET_ID);
    AnswerSwitch.show(TARGET_ID);
  });
});
