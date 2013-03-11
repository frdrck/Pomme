package us.pomme;

import java.io.InputStream;

import android.content.Context;
import android.content.res.TypedArray;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Movie;
import android.net.Uri;
import android.util.AttributeSet;
import android.view.View;

public class GifView extends View {

  private Movie movie;
  private long movieStart = 0;
  private int gifId = 0;

  public GifView(Context context) {
    super(context);
    initializeView();
  }

  public GifView(Context context, AttributeSet attrs) {
    super(context, attrs);
    setAttrs(attrs);
    initializeView();
  }

  public GifView(Context context, AttributeSet attrs, int defStyle) {
    super(context, attrs, defStyle);
    setAttrs(attrs);
    initializeView();
  }

  public void setGIFResource(int resId) {
    this.gifId = resId;
    initializeView();
  }

	public int getGIFResource() {
	    return this.gifId;
	}
	
	private void initializeView() {
	    if (gifId != 0) {
	        InputStream is = getContext().getResources().openRawResource(gifId);
	        movie = Movie.decodeStream(is);
	        movieStart = 0;
	        this.invalidate();
	    }
	}
  
  private void setAttrs(AttributeSet attrs) {
    if (attrs != null) {
        TypedArray a = getContext().obtainStyledAttributes(attrs, R.styleable.GIFView, 0, 0);
        String gifSource = a.getString(R.styleable.GIFView_src);
        //little workaround here. Who knows better approach on how to easily get resource id - please share
        String sourceName = Uri.parse(gifSource).getLastPathSegment().replace(".gif", "");
        setGIFResource(getResources().getIdentifier(sourceName, "drawable", getContext().getPackageName()));
        a.recycle();
    }
  }
  
  @Override
  protected void onDraw(Canvas canvas) {
      canvas.drawColor(Color.TRANSPARENT);
      super.onDraw(canvas);
      long now = android.os.SystemClock.uptimeMillis();
      if (movieStart == 0) {
          movieStart = now;
      }
      if (movie != null) {
          int relTime = (int) ((now - movieStart) % movie.duration());
          movie.setTime(relTime);
          movie.draw(canvas, getWidth() - movie.width(), getHeight() - movie.height());
          this.invalidate();
      }
  }
}