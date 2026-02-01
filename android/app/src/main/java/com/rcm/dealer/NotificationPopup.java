package com.rcm.dealer;

import android.app.Dialog;
import android.content.Context;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.graphics.drawable.ColorDrawable;
import android.view.View;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.TextView;

public class NotificationPopup {

    private static final String PREFS_NAME = "NotificationPrefs";
    private static final String LAST_MESSAGE_ID = "lastMessageId";

    public static void show(Context context, String messageId, String title, String message) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        String lastMessageId = prefs.getString(LAST_MESSAGE_ID, null);

        if (!messageId.equals(lastMessageId)) {
            Dialog dialog = new Dialog(context);
            dialog.setContentView(R.layout.popup_notification);
            dialog.getWindow().setBackgroundDrawable(new ColorDrawable(Color.TRANSPARENT));

            ImageView ivClose = dialog.findViewById(R.id.iv_close);
            TextView tvTitle = dialog.findViewById(R.id.tv_title);
            TextView tvMessage = dialog.findViewById(R.id.tv_message);
            Button btnView = dialog.findViewById(R.id.btn_view);

            tvTitle.setText(title);
            tvMessage.setText(message);

            ivClose.setOnClickListener(v -> dialog.dismiss());

            btnView.setOnClickListener(v -> {
                // Handle view button click (e.g., open a new activity or a URL)
                dialog.dismiss();
            });

            dialog.setOnDismissListener(d -> {
                SharedPreferences.Editor editor = prefs.edit();
                editor.putString(LAST_MESSAGE_ID, messageId);
                editor.apply();
            });

            dialog.show();
        }
    }
}
