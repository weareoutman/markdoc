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
	$(document).on('click', 'a', function(e){
		e.preventDefault();
		window.open(this.href);
	});
});
window.render = function(content){
	_content = content;
};