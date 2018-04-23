package patodomau.btco.bot.mongodb;

import org.bson.Document;

import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.net.URL;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class Image extends Document{
    private String hashCode;
    private String link;
    private String user;
    private boolean downloaded;

    public Image(Document document) {
        this.hashCode = document.getString("_id");
        this.link = document.getString("link");
        this.user = document.getString("user");
        this.downloaded = document.getBoolean("downloaded", false);
    }

    public String getHashCode() {
        return hashCode;
    }

    public void setHashCode(String hashCode) {
        this.hashCode = hashCode;
    }

    public String getLink() {
        return link;
    }

    public void setLink(String link) {
        this.link = link;
    }

    public String getUser() {
        return user;
    }

    public void setUser(String user) {
        this.user = user;
    }

    public boolean isDownloaded() {
        return downloaded;
    }

    public void setDownloaded(boolean downloaded) {
        this.downloaded = downloaded;
    }

    public File getPath() throws IOException {
        return this.getFilepath().getParentFile();
    }

    public File getFilepath() throws IOException {
        Pattern extractImagePattern = Pattern.compile(".*\\/((.*jpg)|(.*png)|(.*mp4)|(.*jpeg))(\\?[0-9])?.*");
        Matcher imageMatcher = extractImagePattern.matcher(this.link);

        if (!imageMatcher.matches()) {
            throw new IOException();
        }

        return new File("/users/" + this.user + "/" + imageMatcher.group(1));
    }

    public boolean download(File path) {
        try {
            File imagePath = new File(path, this.getFilepath().getPath());
            File userPath = new File(path, this.getPath().getPath());

            if (imagePath.exists()) {
                return true;
            }

            if (!userPath.exists()) {
                userPath.mkdirs();
            }

            URL url = new URL(this.link);
            BufferedInputStream bis = new BufferedInputStream(url.openStream());
            FileOutputStream fis = new FileOutputStream(imagePath.getPath());
            byte[] buffer = new byte[1024];
            int count = 0;
            while ((count = bis.read(buffer, 0, 1024)) != -1) {
                fis.write(buffer, 0, count);
            }
            System.out.println(this.getFilepath().getPath() + " downloaded");
            return true;
        } catch (IOException e) {
            System.out.println(this.hashCode + " failed to download");
            return false;
        }
    }
}
