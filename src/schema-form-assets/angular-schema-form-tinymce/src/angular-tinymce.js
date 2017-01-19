angular.module('schemaForm').directive('riTinymce', ['$http', '$window', '$modal', function ($http, $window, $modal) {

    var defaultConf = {
        plugins: "code image -tinyvision autoresize fullscreen media link paste preview textcolor",
        toolbar1: "undo redo | styleselect fontsizeselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image media | preview | fullscreen | forecolor backcolor",
        image_advtab: true,
        forced_root_block: 'p',
        width: '100%',
        height: 400,
        autoresize_min_height: 400,
        autoresize_max_height: 800,
        fullscreen_new_window: true,
        skin_url: 'extra/tinymce/skins/lightgray',
        fullscreen_settings: {
            theme_advanced_path_location: "top"
        },
        paste_preprocess: function (pl, o) {
            o.content = o.content.replace(/(<b>)/ig, "<strong>");
            o.content = o.content.replace(/(<\/b>)/ig, "</strong>");
            o.content = o.content.replace(/(<i>)/ig, "<em>");
            o.content = o.content.replace(/(<\/i>)/ig, "</em>");
        },
        //valid_elements: 'p,a[href],span[class],div[class],img[style|class|src|border=0|alt|title|hspace|vspace|width|height|align|onmouseover|onmouseout|name]',
        tinyvision: {
            source: '/gallery',
            upload: function () {
                $modal.open({
                    templateUrl: 'imgUploader.html',
                    controller: 'ModalImgUploaderCtrl',
                    size: 'md'
                });
            }
        }
    };


    return {
        restrict: 'A',
        require: 'ngModel',
        scope: false,
        link: function (scope, element, attrs, ngModel) {
            var tinyInstance;

            function ensureInstance() {
                if (!tinyInstance) {
                    tinyInstance = tinymce.get(attrs.id);
                }
            }

            function destroy() {
                ensureInstance();
                if (tinyInstance) {
                    console.log("in destroy", tinyInstance);
                    tinyInstance.remove();
                    tinyInstance = null;
                }
            };

            var init = function (config) {
                config = angular.extend(config || {}, defaultConf, {
                    selector: '#' + attrs.id,
                    setup: function (editor) {
                        // tinyMCE.PluginManager.load('tinyvision', '/admin/extra/tinyvision/build/plugin.min.js');
                        $window['focus' + attrs.id] = function () {
                            tinymce.execCommand('mceFocus', false, attrs.id);
                        };

                        var update = function () {
                            var content = editor.getContent();
                            if (ngModel.$viewValue !== content) {
                                ngModel.$setViewValue(content);

                                //certain things like 'destroy' below triggers update inside a $digest cycle.
                                if (!scope.$root.$$phase) {
                                    scope.$apply();
                                }
                            }
                        };

                        editor.on('change', update);
                        editor.on('KeyUp', update);
                        editor.on('ExecCommand', update);
                        editor.on('focus', function (e) {
                            angular.element(e.target.contentAreaContainer).addClass('tx-tinymce-active');
                        });
                        editor.on('blur', function (e) {
                            angular.element(e.target.contentAreaContainer).removeClass('tx-tinymce-active');
                        });
                    }
                });

                tinymce.init(config);
            };

            // If config is set watch it for changes, otherwise just init.
            if (attrs.riTinymce) {
                scope.$watch(attrs.riTinymce, function (c, old) {
                    console.log(c);
                    destroy();
                    if (c) init(c);
                    else init();
                });
            } else {
                init();
                destroy();
            }
        }
    };
}]);