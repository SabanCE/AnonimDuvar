import mongoose from 'mongoose';

const VALID_COLORS = ['yellow', 'cyan', 'pink', 'purple', 'emerald', 'amber'];

const postSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, 'Not içeriği boş bırakılamaz.'],
      trim: true,
      minlength: [1, 'Not en az 1 karakter olmalıdır.'],
      maxlength: [100, 'Not en fazla 100 karakter olabilir.']
    },
    color: {
      type: String,
      enum: {
        values: VALID_COLORS,
        message: '{VALUE} geçerli bir kart rengi değildir.'
      },
      default: 'yellow'
    },
    likes: {
      type: Number,
      default: 0,
      min: [0, 'Beğeni sayısı sıfırdan küçük olamaz.']
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Index to optimize sorting by newest posts
postSchema.index({ createdAt: -1 });

export const Post = mongoose.model('Post', postSchema);
export { VALID_COLORS };
