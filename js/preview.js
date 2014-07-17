var _content;
$(function(){
	var container = $('#container');
	function render(content) {
		container.html(content);
	}
	window.render = render;
	if (_content) {
		render(_content);
	}
	parent.previewLoaded();
});
window.render = function(content){
	_content = content;
};