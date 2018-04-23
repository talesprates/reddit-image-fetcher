package patodomau.btco.bot;

import java.io.File;

import patodomau.btco.bot.mongodb.Image;
import patodomau.btco.bot.mongodb.Mongo;

public class DownloadTask implements Runnable {

	private Image image;
	private final File path;
	private final Mongo mongo;

	public DownloadTask(Image image, File path, Mongo mongo) {
		this.image = image;
		this.path = path;
		this.mongo = mongo;
	}

	@Override
	public void run() {
		if (this.image.download(this.path) && !this.image.isDownloaded()) {
            this.mongo.updateImageDownload(image, true);
        }
	}
}