marked.setOptions({
	langPrefix: 'hljs ',
	highlight: function(code) {
		return hljs.highlightAuto(code).value;
	}
});

$(function() {
	var mode = 'gfm',
		editor = $('#editor'),
		mirror = CodeMirror.fromTextArea(editor[0], {
			mode: mode,
			cursorHeight: 1,
			// lineNumbers: true,
			// lineWrapping: true,
			styleActiveLine: true
		});
	var iframe = $('iframe')[0].contentWindow,
		$iframe = $(iframe),
		preview,
		handler,
		editorScrolling,
		previewScrolling,
		timeout = 500;
	mirror.on('change', function(mirror) {
		clearTimeout(handler);
		handler = setTimeout(render, timeout);
	});
	mirror.on('scroll', function(mirror) {
		// console.log('mirror scroll', previewScrolling);
		if (previewScrolling) {
			previewScrolling = false;
			return;
		}
		editorScrolling = true;
		getPreview();
		var info = mirror.getScrollInfo();
		// console.log(info);
		var top = (preview.outerHeight() - info.clientHeight) *
			info.top / (info.height - info.clientHeight);
		iframe.scrollTo(0, top);
	});
	$iframe.on('scroll', function() {
		// console.log('iframe scroll', editorScrolling);
		if (editorScrolling) {
			editorScrolling = false;
			return;
		}
		previewScrolling = true;
		getPreview();
		var info = mirror.getScrollInfo();
		var top = (info.height - info.clientHeight) *
			$iframe.scrollTop() / (preview.outerHeight() - info.clientHeight);
		mirror.scrollTo(0, top);
	});

	function getPreview() {
		if (!(preview && preview.length > 0)) {
			preview = $('body', iframe.document);
		}
	}

	function render() {
		getPreview();
		// console.log(changed);
		var content = marked(mirror.getDoc().getValue());
		preview.html(content);
	}
});