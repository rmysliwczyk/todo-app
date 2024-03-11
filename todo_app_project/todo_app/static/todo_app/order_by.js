var order_by_form = document.getElementById("order-by-form")
var order_by_selection = document.getElementById("order-by-selection")
var order_by_selection_temp = document.getElementById("order-by-selection-temp")
order_by_selection.value = order_by_selection_temp.value

order_by_selection.addEventListener("change", function () {
	order_by_form.submit()
}) 
