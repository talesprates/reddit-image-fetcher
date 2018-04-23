package patodomau.btco.bot;

import java.io.File;
import java.util.ArrayList;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

import patodomau.btco.bot.mongodb.Image;
import patodomau.btco.bot.mongodb.Mongo;
import patodomau.btco.bot.DownloadTask;

public class MyClass {
	public static void main(String args[]) throws InterruptedException {
		File path = new File(args[0]);
		Mongo mongo = new Mongo("localhost", "reddit-images-db");
		ArrayList<Image> undownloadedImages = mongo.getUndownloadedImages();

		long startTime = System.currentTimeMillis();
		
		ExecutorService pool = Executors.newFixedThreadPool(16);
		for (Image image : undownloadedImages) {
			pool.submit(new DownloadTask(image, path, mongo));
		}
		pool.shutdown();
		pool.awaitTermination(Long.MAX_VALUE, TimeUnit.MILLISECONDS);

		long endTime = System.currentTimeMillis();

		System.out.println("That took " + (endTime - startTime) / 1000 + " seconds");
	}
}
