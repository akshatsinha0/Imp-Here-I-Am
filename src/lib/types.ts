export type Json=
  | string
  | number
  | boolean
  | null
  | { [key:string]:Json|undefined }
  | Json[]

export type Database={
  public:{
    Tables:{
      cleared_chats:{
        Row:{
          cleared_at:string
          conversation_id:string
          user_id:string
        }
        Insert:{
          cleared_at?:string
          conversation_id:string
          user_id:string
        }
        Update:{
          cleared_at?:string
          conversation_id?:string
          user_id?:string
        }
        Relationships:[]
      }
      message_reactions:{
        Row:{
          message_id:string
          user_id:string
          emoji:string
          created_at:string
        }
        Insert:{
          message_id:string
          user_id:string
          emoji:string
          created_at?:string
        }
        Update:{
          message_id?:string
          user_id?:string
          emoji?:string
          created_at?:string
        }
        Relationships:[
          {
            foreignKeyName:"message_reactions_message_id_fkey"
            columns:["message_id"]
            isOneToOne:false
            referencedRelation:"messages"
            referencedColumns:["id"]
          },
        ]
      }
      conversations:{
        Row:{
          created_at:string
          id:string
          participant_1:string
          participant_2:string
          updated_at:string
        }
        Insert:{
          created_at?:string
          id?:string
          participant_1:string
          participant_2:string
          updated_at?:string
        }
        Update:{
          created_at?:string
          id?:string
          participant_1?:string
          participant_2?:string
          updated_at?:string
        }
        Relationships:[]
      }
      messages:{
        Row:{
          content:string
          conversation_id:string
          created_at:string
          file_mime:string|null
          file_name:string|null
          file_url:string|null
          id:string
          message_type:string|null
          readers:string[]|null
          sender_id:string
          reply_to_id:string|null
          edited_at:string|null
          deleted_at:string|null
          scheduled_at:string|null
          forwarded_from_id:string|null
        }
        Insert:{
          content:string
          conversation_id:string
          created_at?:string
          file_mime?:string|null
          file_name?:string|null
          file_url?:string|null
          id?:string
          message_type?:string|null
          readers?:string[]|null
          sender_id:string
        }
        Update:{
          content?:string
          conversation_id?:string
          created_at?:string
          file_mime?:string|null
          file_name?:string|null
          file_url?:string|null
          id?:string
          message_type?:string|null
          readers?:string[]|null
          sender_id?:string
        }
        Relationships:[
          {
            foreignKeyName:"messages_conversation_id_fkey"
            columns:["conversation_id"]
            isOneToOne:false
            referencedRelation:"conversations"
            referencedColumns:["id"]
          },
        ]
      }
      pinned_chats:{
        Row:{
          conversation_id:string
          pinned_at:string
          user_id:string
        }
        Insert:{
          conversation_id:string
          pinned_at?:string
          user_id:string
        }
        Update:{
          conversation_id?:string
          pinned_at?:string
          user_id?:string
        }
        Relationships:[]
      }
      archived_chats:{
        Row:{
          user_id:string
          conversation_id:string
          archived_at:string
        }
        Insert:{
          user_id:string
          conversation_id:string
          archived_at?:string
        }
        Update:{
          user_id?:string
          conversation_id?:string
          archived_at?:string
        }
        Relationships:[]
      }
      groups:{
        Row:{
          id:string
          name:string
          created_by:string
          created_at:string
        }
        Insert:{
          id?:string
          name:string
          created_by:string
          created_at?:string
        }
        Update:{
          id?:string
          name?:string
          created_by?:string
          created_at?:string
        }
        Relationships:[]
      }
      group_members:{
        Row:{
          group_id:string
          user_id:string
          role:string
          joined_at:string
        }
        Insert:{
          group_id:string
          user_id:string
          role?:string
          joined_at?:string
        }
        Update:{
          group_id?:string
          user_id?:string
          role?:string
          joined_at?:string
        }
        Relationships:[]
      }
      group_messages:{
        Row:{
          id:string
          group_id:string
          sender_id:string
          content:string
          created_at:string
          file_url:string|null
          file_name:string|null
          file_mime:string|null
          message_type:string|null
          readers:string[]|null
          reply_to_id:string|null
          edited_at:string|null
          deleted_at:string|null
          scheduled_at:string|null
          forwarded_from_id:string|null
        }
        Insert:{
          id?:string
          group_id:string
          sender_id:string
          content:string
          created_at?:string
          file_url?:string|null
          file_name?:string|null
          file_mime?:string|null
          message_type?:string|null
          readers?:string[]|null
          reply_to_id?:string|null
          edited_at?:string|null
          deleted_at?:string|null
          scheduled_at?:string|null
          forwarded_from_id?:string|null
        }
        Update:{
          id?:string
          group_id?:string
          sender_id?:string
          content?:string
          created_at?:string
          file_url?:string|null
          file_name?:string|null
          file_mime?:string|null
          message_type?:string|null
          readers?:string[]|null
          reply_to_id?:string|null
          edited_at?:string|null
          deleted_at?:string|null
          scheduled_at?:string|null
          forwarded_from_id?:string|null
        }
        Relationships:[]
      }
      user_profiles:{
        Row:{
          created_at:string
          display_name:string
          email:string
          id:string
          is_online:boolean|null
          last_seen:string|null
          avatar_url:string|null
          phone:string|null
          location:string|null
          bio:string|null
          skills:string|null
          interests:string|null
        }
        Insert:{
          created_at?:string
          display_name:string
          email:string
          id:string
          is_online?:boolean|null
          last_seen?:string|null
          avatar_url?:string|null
          phone?:string|null
          location?:string|null
          bio?:string|null
          skills?:string|null
          interests?:string|null
        }
        Update:{
          created_at?:string
          display_name?:string
          email?:string
          id?:string
          is_online?:boolean|null
          last_seen?:string|null
          avatar_url?:string|null
          phone?:string|null
          location?:string|null
          bio?:string|null
          skills?:string|null
          interests?:string|null
        }
        Relationships:[]
      }
      statuses:{
        Row:{
          id:string
          user_id:string
          file_url:string
          file_mime:string|null
          caption:string|null
          created_at:string
          expires_at:string
        }
        Insert:{
          id?:string
          user_id:string
          file_url:string
          file_mime?:string|null
          caption?:string|null
          created_at?:string
          expires_at:string
        }
        Update:{
          id?:string
          user_id?:string
          file_url?:string
          file_mime?:string|null
          caption?:string|null
          created_at?:string
          expires_at?:string
        }
        Relationships:[]
      }
    }
    Views:{
      [_ in never]:never
    }
    Functions:{
      [_ in never]:never
    }
    Enums:{
      [_ in never]:never
    }
    CompositeTypes:{
      [_ in never]:never
    }
  }
}

type DefaultSchema=Database[Extract<keyof Database,"public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"]&DefaultSchema["Views"])
    | { schema:keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema:keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]&
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
>= DefaultSchemaTableNameOrOptions extends { schema:keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]&
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row:infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"]&
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"]&
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row:infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema:keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema:keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
>= DefaultSchemaTableNameOrOptions extends { schema:keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert:infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert:infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema:keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema:keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
>= DefaultSchemaTableNameOrOptions extends { schema:keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update:infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update:infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema:keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema:keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
>= DefaultSchemaEnumNameOrOptions extends { schema:keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema:keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema:keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
>= PublicCompositeTypeNameOrOptions extends { schema:keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants={
  public:{
    Enums:{},
  },
} as const
