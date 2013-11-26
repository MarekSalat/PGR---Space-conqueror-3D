/**
 * Created with IntelliJ IDEA.
 * User: admin
 * Date: 20.11.13
 * Time: 16:37
 * To change this template use File | Settings | File Templates.
 */

class Path {

    pointsArray = [];
    lengthsArray = [];
    length = 0;


    constructor()
    {
    }

    computeLengths()
    {
        this.lengthsArray.push(0);

        for(var i = 0; i < this.pointsArray.length - 1; i++)
        {
            var len = this.pointsArray[i].distanceTo(this.pointsArray[i+1]);
            this.length += len;
            this.lengthsArray.push(this.length);
        }

        for(var j in this.lengthsArray)
        {
            this.lengthsArray[j] /= this.length;
        }
    }

}