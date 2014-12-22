== ideas for performance improvement ==

* Have a .aabb accessor on bodies that is an object. an .updateAABB method will update it. No copying. (like p2)
* implement edge clipping for contact points

* use projection instead of rotation to get bounding boxes (proj, not rotate coords)
* in support functions, transform bodyB into bodyA coords, instead of both into world coords
