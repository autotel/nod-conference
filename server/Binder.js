var Observable=require('onhandlers');
var unique=0;
var Binder=function(){
    var self=this;
    var values={}
    this.unique=unique;
    unique++;
    Observable.call(this);
    Binder.list[this.unique] = this;

    this.update=function(ivalues){
        ivalues.unique=self.unique;
        for(var n in ivalues){
            values[n]=ivalues[n];
        }
        self.handle('update',ivalues);
    }
    this.data=function(){
        return values;
    }
    this.delete=function(){
        self.handle('remove',{unique:self.unique})
        self.off('remove');
        self.off('update');
        for(var a in self){
            self[a]=undefined;
        }
    }
    return this;
}
Binder.list={};
Binder.uniqueOwner=function(unique,cb){
    if(Binder.list[unique]){
        cb(Binder.list[unique]);
    }else{
        console.warn("there is no Binder with unique " + unique +".");
    }
}
Binder.each=function(cb){
    for(var n in Binder.list){
        if (Binder.list[n].unique!==undefined)
            cb(Binder.list[n],n);
    }
}
Binder.remove=function(binder){
    binder.delete();
    delete Binder.list[binder.unique];
}
module.exports=Binder;