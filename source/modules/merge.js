define(function(){
	function merge(left, right){
		var merged = {};
		
		for(var leftAttr in left) {
			merged[leftAttr] = left[leftAttr];
		}
		
		for(var rightAttr in right){
			merged[rightAttr] = right[rightAttr];
		}
		
		return merged;
	}
	
	return merge;
});