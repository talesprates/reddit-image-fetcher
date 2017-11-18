package patodomau.btco.bot.mongodb;

import com.mongodb.BasicDBObject;
import com.mongodb.MongoClient;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.Filters;
import org.bson.Document;
import org.bson.conversions.Bson;

import java.util.ArrayList;
import java.util.List;


public class Mongo {
    private MongoClient mongoClient;
    private MongoDatabase mongoDatabase;
    private MongoCollection<Document> imagesCollection;
    private MongoCollection<Document> albumsCollection;

    public Mongo(String host, String database) {
        this.mongoClient = new MongoClient(host);
        this.mongoDatabase = this.mongoClient.getDatabase(database);
        this.imagesCollection = this.mongoDatabase.getCollection("images");
        this.albumsCollection = this.mongoDatabase.getCollection("albums");
    }

    public ArrayList<Image> getUndownloadedImages() {
        ArrayList<Image> undownloadedImages = new ArrayList<Image>();
        Bson undownloaded = Filters.eq("downloaded", false);
        Bson byUser = new BasicDBObject("user", 1);
        List<Document> results = this.imagesCollection.find(undownloaded).sort(byUser).into(new ArrayList<Document>());

        for (Document document : results) {
            undownloadedImages.add(new Image(document));
        }

        return undownloadedImages;
    }

    public void updateImageDownload(Image image, boolean downloaded) {
        Bson filter = Filters.eq("_id", image.getHashCode());
        BasicDBObject update = new BasicDBObject("$set", new BasicDBObject("downloaded", downloaded));
        this.imagesCollection.updateOne(filter, update);
    }
}
