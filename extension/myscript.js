
$("input[type=password]").each(function() {
    var $passBox = $(this);
    var $form = $passBox.parents('form');
    var action = $form.attr('action');
    showPageAction = true;
    $passBox.click(function() {
        alert('hi, ' + action);
    });
});
