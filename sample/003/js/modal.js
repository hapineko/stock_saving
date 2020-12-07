/**
 * @description モーダルの実装
 * @module simpleModal
 */
(function($) {
    var plugin = {
        // 変数
        globals: {
            layout: 'nodata',
            breakPoint: 768,
            os: 'nodata',
            saveScreenTop: 'nodata',
            saveWindowWidth: 'nodata'
        },
        defaults: {
            modalName: 'modal',
            modalShowName: 'modal--show',
            overlayName: 'modal__overlay',
            bodyName: 'modal__body',
            mainName: 'modal__main',
            innerName: 'modal__inner',
            closeButton: 'modal__closeButton',
            closeButtonTrigger: 'js-simpleModal-close',
            noScrollName: 'noScroll',
            firstElement: 'js-modal-innerFirstElement',
            lastElement: 'js-modal-innerLastElement',
            dataShowModal: 'data-modal-show-target-id',
            visibleModalTrigger: 'js-modal-visibleModalTrigger',
            tabFocusTarget:
                'input:visible:not([type=hidden]), select:visible, textarea, button:visible, a:visible'
        },
        // メソッド
        /**
         * @description 初期化処理。OSチェック、レイアウトチェック、要素の挿入を実施
         * @function init
         * @param {object} options - 【未使用】使用予定だったもの
         */
        init: function(options) {
            // OSのチェック
            plugin._OsCheck();

            // レイアウトのチェック
            plugin._layoutCheck();

            // 必要な要素の挿入
            $('.' + plugin.defaults.innerName).wrap(
                '<div class="' + plugin.defaults.mainName + '"></div>'
            );
            $('.' + plugin.defaults.mainName).wrap(
                '<div class="' + plugin.defaults.bodyName + '"></div>'
            );

            // オーバーレイの挿入
            $('.' + plugin.defaults.modalName).append(
                '<div class="' + plugin.defaults.overlayName + '"></div>'
            );

            // 閉じるボタンの挿入
            $('.' + plugin.defaults.innerName).append(
                '<button class="' +
                    plugin.defaults.closeButton +
                    ' ' +
                    plugin.defaults.closeButtonTrigger +
                    '" type="button"></button>'
            );

            // 閉じるボタンのイベント付与
            $('.' + plugin.defaults.closeButtonTrigger).bind(
                'click.simpleModal',
                plugin.close
            );

            // トリガーボタンのイベント付与
            $('[' + plugin.defaults.dataShowModal + ']').bind(
                'click.simpleModal',
                plugin.open
            );

            // 対象モーダル内にformタグがある場合
            if (
                $('.' + plugin.defaults.innerName)
                    .find('form.js-valid-form')
                    .get(0)
            ) {
                $('.' + plugin.defaults.innerName)
                    .find('form.js-valid-form')
                    .find('input,select,textarea')
                    .each(function() {
                        // 操作不可にする
                        $(this).attr({
                            disabled: true
                        });
                    });
            }
        },
        /**
         * @description ウィンドウの幅を元にPC/SPレイアウトどちらが適用されているかを判定
         * @function _layoutCheck
         * @returns {string} pc | sp
         */
        _layoutCheck: function() {
            // ウィンドウ幅の取得
            var _WINDOW_WIDTH = window.innerWidth;

            // 最新値と比較し、ウィンドウ幅に変化がない場合はfalseを返す
            if (plugin.globals.saveWindowWidth === _WINDOW_WIDTH) {
                return false;
            } else {
                plugin.globals.saveWindowWidth = _WINDOW_WIDTH;
            }

            // ブレイクポイントを元にPC/SPいずれかのレイアウトか判定
            if (_WINDOW_WIDTH >= plugin.globals.breakPoint) {
                plugin.globals.layout = 'pc';
                return 'pc';
            } else {
                plugin.globals.layout = 'sp';
                return 'sp';
            }
        },
        /**
         * @description UAを元に現在アクセスしている端末のOSがiOS・Android・その他OSのどれかを判定
         * @function _OsCheck
         */
        _OsCheck: function() {
            var _UA = navigator.userAgent;
            if (_UA.match(/(iPhone|iPad|iPod)/)) {
                plugin.globals.os = 'iOS';
            } else if (_UA.match(/Android/)) {
                plugin.globals.os = 'Andoird';
            } else {
                plugin.globals.os = 'other';
            }
        },
        /**
         * @description モーダルを開く処理
         * @function open
         * @param {(string|jQuery)} _TRIGGER - 【任意】該当のモーダルを開くためのトリガー
         */
        open: function(_TRIGGER) {
            var _SELECTOR = this.selector;
            var showTargetSelector;

            // モーダルの表示
            if (_SELECTOR === undefined) {
                showTargetSelector =
                    '#' + $(this).attr(plugin.defaults.dataShowModal);
                $(this).addClass(plugin.defaults.visibleModalTrigger);
            } else {
                showTargetSelector = _SELECTOR;
                $(_TRIGGER).addClass(plugin.defaults.visibleModalTrigger);
                if (
                    $(_TRIGGER).attr(plugin.defaults.dataShowModal) ===
                    undefined
                ) {
                    var _ID = _SELECTOR.replace('#', '');
                    $(_TRIGGER).attr(plugin.defaults.dataShowModal, _ID);
                }
            }

            // キーボード操作対応
            if (plugin.globals.os === 'other') {
                $(showTargetSelector)
                    .find(plugin.defaults.tabFocusTarget)
                    .filter(':first')
                    .addClass(plugin.defaults.firstElement);
                $(showTargetSelector)
                    .find(plugin.defaults.tabFocusTarget)
                    .filter(':last')
                    .addClass(plugin.defaults.lastElement);

                // イベント追加
                $(showTargetSelector)
                    .find(plugin.defaults.tabFocusTarget)
                    .bind('keydown.simpleModal', function(event) {
                        plugin.tabFocus(showTargetSelector, event);
                    });
            }

            // 背面の固定
            var _CURRENT_TOP = $(window).scrollTop();
            if ($('.' + plugin.defaults.modalShowName).length !== 0) {
                $(showTargetSelector).addClass(plugin.defaults.modalShowName);
            } else {
                // モーダル開く前の位置を保存
                plugin.globals.saveScreenTop = _CURRENT_TOP;

                // フェードイン
                $(showTargetSelector).addClass(plugin.defaults.modalShowName);
                $('body')
                    .addClass(plugin.defaults.noScrollName)
                    .css({ top: -_CURRENT_TOP });
            }

            // 対象モーダル内にformタグ（バリデーション付）がある場合
            if (
                $(showTargetSelector)
                    .find('form.js-valid-form')
                    .get(0) !== undefined
            ) {
                $(showTargetSelector)
                    .find('form.js-valid-form')
                    .find('input,select,textarea')
                    .not(':hidden')
                    .each(function() {
                        // 操作可能にする
                        $(this).attr('disabled', false);

                        // バリデーション有効化
                        var _NAME = $(this).attr('name');
                        $('[name=' + _NAME + ']').validation(
                            'statusChange',
                            'true'
                        );
                    });
            }

            // 最初の要素にフォーカスをあてる
            if (plugin.globals.os === 'other') {
                $(showTargetSelector)
                    .find('.' + plugin.defaults.firstElement)
                    .focus();
            }

            // 再開閉時の表示位置ずれ防止のため、一番上へ強制スクロールさせる
            $(showTargetSelector)
                .find('.' + plugin.defaults.innerName)
                .scrollTop(0);
        },
        /**
         * @description モーダルを閉じる処理
         * @function close
         */
        close: function() {
            var _SELECTOR = this.selector;
            var hideTargetSelector;
            if (_SELECTOR === undefined) {
                hideTargetSelector = $(this).parents(
                    '.' + plugin.defaults.modalName
                );
            } else {
                hideTargetSelector = _SELECTOR;
            }

            // キーボード操作対応用クラス・イベント削除
            if (plugin.globals.os === 'other') {
                $(hideTargetSelector)
                    .find(plugin.defaults.tabFocusTarget)
                    .filter(':first')
                    .removeClass(plugin.defaults.firstElement);
                $(hideTargetSelector)
                    .find(plugin.defaults.tabFocusTarget)
                    .filter(':last')
                    .removeClass(plugin.defaults.lastElement);

                // イベント削除
                $(hideTargetSelector)
                    .find(plugin.defaults.tabFocusTarget)
                    .unbind('keydown.simpleModal');
            }

            // フェードアウト
            $(hideTargetSelector).removeClass(plugin.defaults.modalShowName);

            // 背面の固定解除
            if ($('.' + plugin.defaults.modalShowName).length === 0) {
                // スクロール無効化解除
                $('body')
                    .removeClass(plugin.defaults.noScrollName)
                    .css({ top: 0 });
                window.scrollTo(0, plugin.globals.saveScreenTop);
            }

            // 対象モーダル内にformタグがある場合
            if (
                $(hideTargetSelector)
                    .find('form.js-valid-form')
                    .get(0)
            ) {
                $(hideTargetSelector)
                    .find('form.js-valid-form')
                    .find('input,select,textarea')
                    .each(function() {
                        // 操作不可にする
                        $(this).attr({
                            disabled: true,
                            checked: false
                        });

                        // バリデーション有効化
                        var _NAME = $(this).attr('name');
                        $('[name=' + _NAME + ']').validation(
                            'statusChange',
                            'false'
                        );
                    });
            }

            // トリガーがある場合はそこにフォーカスを戻す
            if (plugin.globals.os === 'other') {
                var _MODAL_ID = $(hideTargetSelector).attr('id');
                if (_MODAL_ID !== undefined) {
                    $(
                        '[' +
                            plugin.defaults.dataShowModal +
                            '=' +
                            _MODAL_ID +
                            ']' +
                            '.' +
                            plugin.defaults.visibleModalTrigger
                    )
                        .focus()
                        .removeClass(plugin.defaults.visibleModalTrigger);
                }
            }
        },
        /**
         * @description モーダルが開かれている状態でキーボード操作をした際に、モーダル内のみ操作可能とするための処理
         * @function tabFocus
         * @param {(string|jQuery)} _MODAL - 【必須】対象のモーダル
         * @param {object} _EVENT - 【必須】実行されたイベントの詳細
         */
        tabFocus: function(_MODAL, _EVENT) {
            var _NOW_FOCUS = $(':focus');

            // tabキーのみ
            if (_EVENT.keyCode === 9 && !_EVENT.shiftKey) {
                if ($(_NOW_FOCUS).hasClass(plugin.defaults.lastElement)) {
                    _EVENT.preventDefault();
                    $(_MODAL)
                        .find('.' + plugin.defaults.firstElement)
                        .focus();
                }
            }

            // shift+tab
            if (_EVENT.keyCode === 9 && _EVENT.shiftKey) {
                if ($(_NOW_FOCUS).hasClass(plugin.defaults.firstElement)) {
                    _EVENT.preventDefault();
                    $(_MODAL)
                        .find('.' + plugin.defaults.lastElement)
                        .focus();
                }
            }
        }
    };

    $.fn.simpleModal = function(method) {
        if (plugin[method]) {
            return plugin[method].apply(
                this,
                Array.prototype.slice.call(arguments, 1)
            );
        } else if (typeof method === 'object' || !method) {
            return plugin.init.apply(this, arguments);
        } else {
            $.error(method + 'というメソッドはありません');
        }
    };
})(jQuery);
