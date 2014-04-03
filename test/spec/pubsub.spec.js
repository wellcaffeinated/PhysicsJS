describe("PubSub events", function() {

    var ps = Physics.util.pubsub();
    var topic = 'my-topic';
    var callbacks;
    var data = {
        foo: 'bar'
    };
    var moreData = {
        foo: 'blee'
    };

    callbacks = jasmine.createSpyObj('callbacks', [
        'called',
        'calledOnce',
        'notCalled'
    ]);

    ps.on(topic, callbacks.called, callbacks);
    ps.one(topic, callbacks.calledOnce, callbacks);
    ps.on(topic, callbacks.notCalled, callbacks);
    ps.off(topic, callbacks.notCalled);

    it("should not call callbacks that are subscribed to different topics", function() {

        ps.emit('not-my-topic');

        expect( callbacks.called ).not.toHaveBeenCalled();
        expect( callbacks.calledOnce ).not.toHaveBeenCalled();
        expect( callbacks.notCalled ).not.toHaveBeenCalled();

    });

    it("should call callbacks with emitted data", function() {

        ps.emit( topic, data );

        expect( callbacks.called.calls[0].args[0] ).toEqual( data );
        expect( callbacks.calledOnce.calls[0].args[0] ).toEqual( data );
    });

    it("should call callbacks with event info", function() {

        expect( callbacks.called.calls[0].args[1].topic ).toEqual( topic );
        // expect( callbacks.called.calls[0].args[1].handler._bindfn_ ).toEqual( callbacks.called );
        expect( callbacks.calledOnce.calls[0].args[1].topic ).toEqual( topic );
        // expect( callbacks.calledOnce.calls[0].args[1].handler._bindfn_ ).toEqual( callbacks.calledOnce );
    });

    it("should call the callbacks the correct number of times", function() {

        ps.emit( topic, moreData );
        ps.off( topic, true );
        ps.emit( topic, moreData );

        expect( callbacks.called.calls.length ).toEqual( 2 );
        expect( callbacks.calledOnce.calls.length ).toEqual( 1 );
        expect( callbacks.notCalled ).not.toHaveBeenCalled();
    });
});