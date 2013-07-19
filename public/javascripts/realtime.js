var socket = io.connect('http://localhost');
socket.on('activity', function(activity) {
	  if($("#activity_table tr").length >= 11) {
		    delLastTr('activity_table');
    }

	 var tr_new = '<tr><td>'+ activity.url +'</td><td>'+ activity.ip +'</td><td>'+ activity.timestamp +'</td></tr>';
	 prependtr('activity_table', tr_new);
});

socket.on('pvs', function(pvs) {
  	emptyTbody('pv_table');

  	for(var key in pvs) {
  		  var tr_new = '<tr><td>'+ key +'</td><td>'+ pvs[key].count +'</td></tr>';
  		  appendTr('pv_table', tr_new);
  	}
});

socket.on('uv', function(uv) {
	 var tr_new = '<tr><td>'+ uv.ip +'</td><td>'+ uv.timestamp +'</td></tr>';
	 appendTr('uv_table', tr_new);
});

function prependtr(table_id, tr_new){
    $('#'+table_id).prepend(tr_new);
}

function appendTr(table_id, tr_new) {
    $('#'+table_id).append(tr_new);
}

function delLastTr(table_id){
    $("#"+table_id+">tbody>tr:last").remove();
}

function emptyTbody(table_id) {
    $('#'+ table_id +' tbody').empty();
}
