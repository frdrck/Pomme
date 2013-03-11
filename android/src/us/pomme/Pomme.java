package us.pomme;

import android.app.Activity;
import android.os.Bundle;
import android.util.Log;
import android.view.MotionEvent;
import android.view.View;
import android.widget.TextView;
import android.widget.ViewFlipper;

public class Pomme extends Activity {

  private ViewFlipper viewFlipper;
  private float lastX;

  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    setContentView(R.layout.main);
    viewFlipper = (ViewFlipper) findViewById(R.id.view_flipper);
  }

  public void showCard(View view) {
    TextView textView = (TextView) view;
    Log.v("showCard", (String) textView.getText());
  }

  @Override
  public boolean onTouchEvent(MotionEvent touchevent) {
    switch (touchevent.getAction()) {
	    case MotionEvent.ACTION_DOWN: {
	      lastX = touchevent.getX();
	      break;
	    }
	    case MotionEvent.ACTION_UP: {
	      float currentX = touchevent.getX();
	      if (lastX < currentX) {
	        if (viewFlipper.getDisplayedChild() == 0)
	          break;
	        viewFlipper.setInAnimation(this, R.anim.in_from_left);
	        viewFlipper.setOutAnimation(this, R.anim.out_to_right);
	        viewFlipper.showNext();
	      }
	      if (lastX > currentX) {
	        if (viewFlipper.getDisplayedChild() == 1)
	          break;
	        viewFlipper.setInAnimation(this, R.anim.in_from_right);
	        viewFlipper.setOutAnimation(this, R.anim.out_to_left);
	        viewFlipper.showPrevious();
	      }
	      break;
	    }
    }
    return false;
  }
}