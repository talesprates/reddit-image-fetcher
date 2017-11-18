package patodomau.btco.bot;

import patodomau.btco.bot.mongodb.Image;
import patodomau.btco.bot.mongodb.Mongo;

import java.io.*;
import java.util.ArrayList;

public class MyClass {
    public static void main(String args[]) {
        Mongo mongo = new Mongo("localhost", "reddit-images-db");
        ArrayList<Image> undownloadedImages = mongo.getUndownloadedImages();

        for (Image image : undownloadedImages) {
            if (image.download() && !image.isDownloaded()) {
                mongo.updateImageDownload(image, true);
            }
        }
    }
}
